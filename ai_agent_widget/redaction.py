"""Remove credentials from public session data and exported reports."""

import re


REDACTED = "[REDACTED]"
SENSITIVE_NAME = re.compile(
    r"password|passphrase|api[_\s-]?key|secret|token|credential|private[_\s-]?key|"
    r"access[_\s-]?key|authorization|bearer",
    re.IGNORECASE,
)
ASSIGNMENT = re.compile(
    r"\b((?:api[_\s-]?key|password|passphrase|secret|token|credential|"
    r"private[_\s-]?key|access[_\s-]?key))\s*(?::|=|\bto\b)\s*"
    r"(['\"]?)([^\s,;\"']+)",
    re.IGNORECASE,
)
VALUE_KEYS = {"value", "text", "field_value", "new_value"}


def _sensitive_values(data, found):
    if isinstance(data, dict):
        field_name = data.get("fieldname") or data.get("field")
        sensitive_field = isinstance(field_name, str) and bool(SENSITIVE_NAME.search(field_name))
        sensitive_field |= data.get("fieldtype") == "Password"
        for key, value in data.items():
            if (SENSITIVE_NAME.search(str(key)) or sensitive_field and key in VALUE_KEYS) and isinstance(value, str):
                if len(value) >= 4 and value != REDACTED:
                    found.add(value)
            _sensitive_values(value, found)
    elif isinstance(data, list):
        for item in data:
            _sensitive_values(item, found)


def sensitive_values(data):
    found = set()
    _sensitive_values(data, found)
    return found


def redact_text(value, secrets=()):
    """Mask known field values and standalone credential assignments in text."""
    if not isinstance(value, str):
        return value
    for secret in sorted(secrets, key=len, reverse=True):
        value = value.replace(secret, REDACTED)
    return ASSIGNMENT.sub(lambda match: f"{match.group(1)}: {REDACTED}", value)


def redact_session_data(data):
    """Return a sanitized copy, including nested action args and free-text results."""
    secrets = sensitive_values(data)

    def clean(value):
        if isinstance(value, dict):
            field_name = value.get("fieldname") or value.get("field")
            sensitive_field = isinstance(field_name, str) and bool(SENSITIVE_NAME.search(field_name))
            sensitive_field |= value.get("fieldtype") == "Password"
            return {
                key: REDACTED if SENSITIVE_NAME.search(str(key)) or sensitive_field and key in VALUE_KEYS
                else clean(item)
                for key, item in value.items()
            }
        if isinstance(value, list):
            return [clean(item) for item in value]
        return redact_text(value, secrets)

    return clean(data)
