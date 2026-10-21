"""Validation for the AI Agent settings page."""

import frappe
from frappe import _
from frappe.model.document import Document


class AIAgentSettings(Document):
    def validate(self):
        direct_key = self.get("direct_api_key")
        if direct_key and not self.is_dummy_password(direct_key):
            self.direct_api_key_provider = self.provider
        elif not direct_key:
            self.direct_api_key_provider = None

        if not 0 <= float(self.temperature or 0) <= 1:
            frappe.throw(_("Temperature must be between 0 and 1."))
        if int(self.max_tokens or 0) < 100:
            frappe.throw(_("Maximum tokens must be at least 100."))
        if self.ollama_base_url and not self.ollama_base_url.startswith(("http://", "https://")):
            frappe.throw(_("Ollama URL must start with http:// or https://."))


@frappe.whitelist()
def get_active_api_key():
    """Return the saved key only after a System Manager requests to reveal it."""
    frappe.only_for("System Manager")
    settings = frappe.get_single("AI Agent Settings")
    provider = settings.provider
    if provider not in ("Gemini", "Groq", "OpenRouter"):
        frappe.throw(_("Select a hosted provider to reveal its API key."))

    key = settings.get_password(f"{provider.lower()}_api_key", raise_exception=False)
    if not key and settings.direct_api_key_provider == provider:
        key = settings.get_password("direct_api_key", raise_exception=False)
    if not key:
        frappe.throw(_("No API key is saved for {0}.").format(provider))
    return key
