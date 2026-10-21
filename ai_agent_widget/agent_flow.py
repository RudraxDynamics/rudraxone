"""Run browser actions one at a time, using their real results for the next decision."""

from uuid import uuid4

import frappe
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from nutaan_erp.core.tools import get_all_tools
from nutaan_erp.utils.context import build_system_prompt

from .providers import get_configured_manager


SESSION_TTL = 1800
MAX_ACTIONS = 25
TOOLS = {tool.name for tool in get_all_tools()}


def _session_key(session_id):
    return f"ai_agent_widget:flow:{session_id}"


def _content_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in content
        ).strip()
    return str(content or "")


def _save(session_id, state):
    frappe.cache().set_value(_session_key(session_id), state, expires_in_sec=SESSION_TTL)


def _verified_save(state, saved_document):
    pending = state["pending"]
    button_text = pending["args"].get("button_text", "").strip().lower()
    if pending["name"] != "click_button" or button_text not in ("save", "update"):
        return None
    if not isinstance(saved_document, dict):
        return None
    doctype = saved_document.get("doctype")
    name = saved_document.get("name")
    if not isinstance(doctype, str) or not isinstance(name, str) or not doctype or not name:
        return None
    if not frappe.db.exists(doctype, name) or not frappe.has_permission(doctype, "read", name):
        return None
    return {"doctype": doctype, "name": name, "created": saved_document.get("created") is True}


def _collect_record_links(state, candidates):
    if not isinstance(candidates, list):
        return
    links = state["record_links"]
    for candidate in candidates[:20]:
        if not isinstance(candidate, dict):
            continue
        doctype = candidate.get("doctype")
        name = candidate.get("name")
        if not isinstance(doctype, str) or not isinstance(name, str) or not doctype or not name:
            continue
        if len(doctype) > 140 or len(name) > 140 or any(
            item["doctype"] == doctype and item["name"] == name for item in links
        ):
            continue
        try:
            if frappe.db.exists(doctype, name) and frappe.has_permission(doctype, "read", name):
                links.append({"doctype": doctype, "name": name})
        except Exception:
            continue
        if len(links) >= 50:
            break


def run_step(data, user, context=None):
    """Start a request or continue it with one completed browser action."""
    session_id = data.get("session_id")
    if session_id:
        state = frappe.cache().get_value(_session_key(session_id))
        if not state or state.get("user") != user or not state.get("pending"):
            frappe.throw("This assistant request has expired. Please send it again.")
        pending = state.pop("pending")
        result = str(data.get("action_result") or "")[:6000]
        saved = _verified_save({"pending": pending}, data.get("saved_document"))
        if saved:
            state["saved_document"] = saved
            _collect_record_links(state, [saved])
            result = f"✅ Saved {saved['doctype']} {saved['name']}"
        elif pending["name"] == "click_button" and pending["args"].get("button_text", "").strip().lower() in ("save", "update"):
            result = result if result.startswith(("❌", "⚠️")) else "❌ Save was not confirmed. Check the form for validation errors."
        if pending["name"] in ("navigate", "search_doctype", "get_doctype_list", "get_field_value"):
            _collect_record_links(state, data.get("record_links"))
        state["messages"].append(ToolMessage(content=result, tool_call_id=pending["id"]))
    else:
        message = str(data.get("message") or "").strip()
        if not message:
            frappe.throw("Enter a request for the assistant.")
        session_id = uuid4().hex
        history = data.get("history") or []
        if history and history[-1].get("role") == "user" and history[-1].get("content") == message:
            history = history[:-1]
        prompt = build_system_prompt(context or {}).replace(
            "You are Nutaan AI, an intelligent automation assistant for ERPNext.",
            "You are RudraX Pilot, an assistant for RudraX One."
        )
        prompt += (
            "\nBROWSER ACTIONS: Request exactly one tool call at a time. The browser executes it "
            "and returns its real result before you decide what to do next. Treat errors and "
            "validation messages as actual outcomes; correct them or ask the user. "
            "create_doc only opens a blank form. Setting fields does not save it. "
            "Never say a record was created until Save returns a confirmed document ID. "
            "Do not repeat a successful Save. Keep final answers concise. "
            "For explanations in the narrow chat panel, prefer short paragraphs and bullets. "
            "Use a table only when columns make the answer clearer, and keep it compact. "
            "Distinguish required information from optional details when answering setup questions. "
            "Write plain Markdown without escaped pipes or line endings."
        )
        messages = [SystemMessage(content=prompt)]
        for item in history[-20:]:
            content = str(item.get("content") or "")[:3000]
            if item.get("role") == "user":
                messages.append(HumanMessage(content=content))
            elif item.get("role") == "assistant":
                messages.append(AIMessage(content=content))
        messages.append(HumanMessage(content=message))
        state = {"user": user, "messages": messages, "action_count": 0,
                 "create_started": False, "saved_document": None, "pending": None,
                 "record_links": []}

    if state["action_count"] >= MAX_ACTIONS:
        frappe.cache().delete_value(_session_key(session_id))
        return {"session_id": session_id, "done": True,
                "content": "I stopped after too many actions. Please review the page and send a new request.",
                "record_links": state["record_links"]}

    model = get_configured_manager().model.bind_tools(get_all_tools())
    answer = model.invoke(state["messages"])
    calls = getattr(answer, "tool_calls", None) or []
    if calls:
        call = calls[0]
        if call.get("name") not in TOOLS:
            frappe.throw("The assistant requested an unsupported action.")
        call_id = call.get("id") or uuid4().hex
        args = call.get("args") or {}
        state["messages"].append(AIMessage(content=_content_text(answer.content), tool_calls=[
            {"name": call["name"], "args": args, "id": call_id}
        ]))
        state["pending"] = {"id": call_id, "name": call["name"], "args": args}
        state["action_count"] += 1
        if call["name"] == "create_doc":
            state["create_started"] = True
        _save(session_id, state)
        return {"session_id": session_id, "done": False,
                "action": {"tool": call["name"], "args": args}}

    content = _content_text(answer.content) or "Done."
    if state["create_started"] and not state["saved_document"]:
        content = "No record has been saved yet. Please review the form and its validation messages."
    elif state["saved_document"]:
        saved = state["saved_document"]
        verb = "Created" if saved["created"] else "Saved"
        content = f"{verb} {saved['doctype']} {saved['name']}."
    frappe.cache().delete_value(_session_key(session_id))
    return {"session_id": session_id, "done": True, "content": content,
            "saved_document": state["saved_document"], "record_links": state["record_links"]}
