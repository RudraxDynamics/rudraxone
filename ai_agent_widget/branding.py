"""User-facing RudraX Pilot branding for generated replies."""

import re

from nutaan_erp.utils.context import build_system_prompt


_SOURCE_IDENTITY = "You are Nutaan AI, an intelligent automation assistant for ERPNext."
_PILOT_IDENTITY = "You are RudraX Pilot, an assistant for RudraX One."
_PRODUCT_NAMES = re.compile(r"\b(?:ERP\s*Next|Frappe|Nutaan\s+(?:AI|ERP))\b", re.IGNORECASE)


def build_pilot_prompt(context):
    prompt = build_system_prompt(context or {}).replace(_SOURCE_IDENTITY, _PILOT_IDENTITY)
    return brand_response_text(prompt) + (
        "\nBRANDING: You are RudraX Pilot, part of RudraX One. "
        "In every user-facing answer, call the product RudraX One. "
        "Do not mention the names of the underlying framework or source application. "
        "Use the actual document type and record names when referring to user data."
    )


def brand_response_text(value):
    """Keep generated answer text on brand even when the model misses the instruction."""
    return _PRODUCT_NAMES.sub("RudraX One", str(value or ""))
