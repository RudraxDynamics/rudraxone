"""Build an agent from the provider selected in AI Agent Settings."""

from frappe import _
import frappe

from nutaan_erp import AgentConfig, AgentManager
from nutaan_erp.core.intent_engine import IntentEngine
from nutaan_erp.core.tools import get_all_tools
from nutaan_erp.core.tracker import ActionTracker

from .branding import build_pilot_prompt


SETTINGS_DOCTYPE = "AI Agent Settings"


def _credential(settings, fieldname):
    """Fetch a password server-side; never return it to the browser."""
    return settings.get_password(fieldname, raise_exception=False)


def _model_for_provider(provider, settings, api_key, model_name, temperature, max_tokens):
    if provider == "Gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    try:
        from langchain_openai import ChatOpenAI
    except ImportError:
        frappe.throw(_("The provider integration is not installed. Install the app requirements and restart the server."))

    base_urls = {
        "Groq": "https://api.groq.com/openai/v1",
        "OpenRouter": "https://openrouter.ai/api/v1",
        "Ollama": settings.ollama_base_url or "http://127.0.0.1:11434/v1",
    }
    return ChatOpenAI(
        model=model_name,
        api_key=api_key,
        base_url=base_urls[provider],
        temperature=temperature,
        max_tokens=max_tokens,
    )


class ConfiguredAgentManager(AgentManager):
    """Use the same selected model for intent analysis and tool execution."""

    def __init__(self, config, model):
        self.config = config
        self.agent = None
        self.tracker = ActionTracker()
        self.intent_engine = IntentEngine.__new__(IntentEngine)
        self.intent_engine.config = config
        self.intent_engine.llm = model
        self.model = model

    def _initialize_agent(self, context):
        from langchain.agents import create_agent

        self.agent = create_agent(
            model=self.model,
            tools=get_all_tools(),
            system_prompt=build_pilot_prompt(context),
        )


def get_configured_manager():
    """Read the active site settings and return a ready-to-use agent manager."""
    settings = frappe.get_single(SETTINGS_DOCTYPE)
    if not settings.enabled:
        frappe.throw(_("The AI Agent is disabled in AI Agent Settings."))

    provider = settings.provider
    if provider not in ("Gemini", "Groq", "OpenRouter", "Ollama"):
        frappe.throw(_("Select a supported provider in AI Agent Settings."))

    prefix = provider.lower()
    api_key = "ollama" if provider == "Ollama" else _credential(settings, f"{prefix}_api_key")
    if provider != "Ollama" and not api_key and settings.direct_api_key_provider == provider:
        api_key = _credential(settings, "direct_api_key")
    model_name = (settings.get(f"{prefix}_model") or "").strip()
    if not api_key:
        frappe.throw(_("Set the API key for {0} in AI Agent Settings.").format(provider))
    if not model_name:
        frappe.throw(_("Set the model for {0} in AI Agent Settings.").format(provider))

    temperature = float(settings.temperature or 0)
    max_tokens = int(settings.max_tokens or 4000)
    config = AgentConfig(
        api_key=api_key,
        model_name=model_name,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    model = _model_for_provider(provider, settings, api_key, model_name, temperature, max_tokens)
    return ConfiguredAgentManager(config, model)
