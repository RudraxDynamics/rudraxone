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
