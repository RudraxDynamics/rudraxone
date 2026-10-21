# Nutaan AI Agent - ERPNext/Frappe Integration

AI-powered assistant for ERPNext automation and intelligent task execution.

## What It Does

Transform ERPNext into an AI-powered workspace:
- **Natural Language Commands**: Just tell it what you want
- **Automatic Workflows**: Handles multi-step processes
- **Smart Assistance**: Asks questions when needed
- **Document Management**: Creates and manages any ERPNext document
- **Data Intelligence**: Searches, validates, and processes data

## Quick Start

See [INSTALLATION.md](INSTALLATION.md) for complete setup guide.

## Installation

Complete installation instructions available in [INSTALLATION.md](INSTALLATION.md).

**Quick Install:**
```bash
cd ~/frappe-bench
bench get-app https://github.com/RudraxDynamics/rudraxone
bench --site mysite.local install-app ai_agent_widget
bench restart
```

**Configure API Key** in `site_config.json`:
```json
{
  "gemini_api_key": "your-api-key"
}
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## Usage

After installation:
1. Look for the **purple lightning button** in bottom-right
2. Click to open AI assistant
3. Type commands like:
   - "Create a Sales Order"
   - "Show me all customers"
   - "Add 5 units of Product X to this order"

## Features

- 🤖 Natural language understanding
- 📋 Document creation and management
- 🔍 Smart search and navigation
- ✅ Automatic data validation
- 📊 Session reports and exports
- 💬 WhatsApp and email sharing

## Support

- **Documentation**: [INSTALLATION.md](INSTALLATION.md)
- **Email**: hara@nutaan.com
- **Package**: https://pypi.org/project/nutaan-erp/

## License

MIT

## AI provider settings

The widget reads its provider configuration from **AI Agent Settings** in the Desk
(`app/ai-agent-settings`). A System Manager can save keys for Gemini, Groq, and
OpenRouter as protected Password fields, or configure a local Ollama endpoint.
System Managers can use **Direct API Key — Reveal / Copy** to retrieve the
original key saved for the active provider. The key is shown only after this
action and is not written to a plain-text settings field. A previously saved
Direct API Key is kept as a fallback for its original provider; new keys should
be entered in the provider-specific Password fields.
Select the active provider and enter a model that supports tool calls. The widget
uses the selected provider for both intent analysis and task execution.

After updating the app, install its Python requirements and run a site migration:

```sh
./env/bin/pip install -e apps/ai_agent_widget
bench --site test.local migrate
```

Existing keys in `site_config.json` are not copied automatically. Enter the key
again in AI Agent Settings, then remove the old key from site configuration.

