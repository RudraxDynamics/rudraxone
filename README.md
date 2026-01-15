# AI Agent Platform

Modular AI agent system with autonomous task execution capabilities.

## Architecture

This platform consists of three independent, reusable components:

```
ai-agent-widget/
├── 🔒 sdk/              # Python SDK - Core AI agent logic
├── 🎨 widget/           # JavaScript Widget - Universal chat UI
└── 🔌 integrations/     # Platform-specific wrappers
    └── frappe/          # ERPNext/Frappe integration
```

### Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| **SDK** | Python package with AI agent logic | Backend for any Python app |
| **Widget** | Vanilla JS/CSS chat interface | Frontend for any website |
| **Frappe Integration** | ERPNext wrapper | Deploy to ERPNext/Frappe |

---

## Quick Start

### For ERPNext Users

```bash
# 1. Install SDK from PyPI
cd ~/frappe-bench
./env/bin/pip install nutaan-erp

# 2. Install Frappe app
bench get-app apps/ai-agent-widget/integrations/frappe
bench --site mysite.local install-app ai_agent_widget

# 3. Configure
# Add to sites/mysite.local/site_config.json:
{
  "gemini_api_key": "your-api-key"
}

# 4. Restart
bench restart
```

**See**: [Frappe Integration Guide](integrations/frappe/README.md)

### For Custom Python Applications

```bash
# Install SDK from PyPI
pip install nutaan-erp
```

```python
from nutaan_erp import AgentManager, AgentConfig

config = AgentConfig(api_key="your-gemini-key")
manager = AgentManager(config)

result = manager.execute(
    message="Create a sales order",
    context={...},
    history=[]
)
```

**See**: [SDK Documentation](sdk/README.md)

### For Any Website

```html
<!-- Include widget -->
<link rel="stylesheet" href="widget/dist/ai-widget.css">
<script src="widget/dist/ai-widget.js"></script>
```

**See**: [Widget Documentation](widget/README.md)

---

## Features

### 🤖 Intelligent Automation
- Natural language understanding
- Multi-step task execution
- Automatic error correction
- Smart clarification questions

### 📋 Document Operations
- Create any ERPNext document
- Fill forms automatically
- Manage data in tables
- Save and submit workflows

### 🔍 Smart Navigation
- Navigate to any page
- Search across all records
- Quick data access
- Context-aware assistance

### 📊 Session Management
- Export activity reports
- Share via WhatsApp/Email
- Track all actions
- Professional PDF reports

### 🎨 Modern Interface
- Beautiful chat UI
- Real-time feedback
- Mobile-responsive
- Dark mode support

---

## Documentation

- **[SDK Documentation](sdk/README.md)** - Python backend API
- **[Widget Documentation](widget/README.md)** - Frontend widget
- **[Frappe Integration](integrations/frappe/README.md)** - ERPNext setup
- **[Architecture Guide](docs/architecture.md)** - System design
- **[Deployment Guide](docs/deployment.md)** - Production deployment

---

## Use Cases

### ERPNext Automation
```
User: "Create a sales order for ABC Corp with 10 units of Product X"
AI: ✅ Creates complete sales order with all details
```

### Data Entry Assistant
```
User: "Add a new customer named John Doe"
AI: ✅ Creates customer with provided information
```

### Navigation Helper
```
User: "Show me pending invoices"
AI: ✅ Navigates and applies filters automatically
```

---

## Project Structure

```
ai-agent-widget/
│
├── sdk/                             # Python SDK
│   ├── nutaan_erp/
│   │   ├── core/                   # Agent, config, tools
│   │   ├── integrations/           # LangChain
│   │   └── utils/                  # Context building
│   ├── setup.py
│   └── README.md
│
├── widget/                          # Frontend Widget
│   ├── src/                        # Source files
│   ├── dist/                       # Production builds
│   ├── examples/                   # Usage examples
│   └── README.md
│
├── integrations/                    # Platform Integrations
│   └── frappe/                     # ERPNext integration
│       ├── ai_agent_widget/
│       ├── setup.py
│       └── README.md
│
├── docs/                           # Documentation
│   ├── architecture.md
│   └── deployment.md
│
└── README.md                       # This file
```

---

## Development

### Prerequisites
- Python 3.8+
- Node.js (optional, for widget development)
- Frappe Bench (for ERPNext integration)

### Setup Development Environment

```bash
# 1. Clone repository
git clone https://github.com/RudraxDynamics/rudraxone.git
cd rudraxone

# 2. Install SDK from PyPI
pip install nutaan_erp

# 3. For Frappe development
cd ~/frappe-bench/apps
ln -s /path/to/ai-agent-widget/integrations/frappe ai_agent_widget
bench --site mysite.local install-app ai_agent_widget
```

### Making Changes

**SDK (Backend)**:
```bash
# Edit sdk/nutaan_erp/**/*.py
# No build needed - Python is interpreted
```

**Widget (Frontend)**:
```bash
# Edit widget/src/widget.js or widget.css
cp widget/src/* widget/dist/
```

**Frappe Integration**:
```bash
# Edit integrations/frappe/ai_agent_widget/api.py
bench --site mysite.local migrate
bench restart
```

---

## Deployment

### ERPNext Production

```bash
# Production server
cd ~/frappe-bench
./env/bin/pip install nutaan_erp
bench --site production.com install-app ai_agent_widget
bench build --app ai_agent_widget
bench restart
```

### Custom Application

```bash
# Install SDK from PyPI
pip install nutaan_erp

# Include widget in your HTML
<link rel="stylesheet" href="widget/dist/ai-widget.css">
<script src="widget/dist/ai-widget.js"></script>
```

---

## Configuration

### Gemini API Key

Get your key from: https://makersuite.google.com/app/apikey

**For Frappe**:
```json
// sites/mysite.local/site_config.json
{
  "gemini_api_key": "your-key-here",
  "gemini_model": "gemini-2.0-flash-exp"
}
```

**For Custom Apps**:
```python
from nutaan_erp import AgentConfig

config = AgentConfig(
    api_key="your-key-here",
    model_name="gemini-2.0-flash-exp"
)
```

---

## Examples

See `widget/examples/` for usage examples:
- `standalone.html` - Vanilla JavaScript
- `react-example.jsx` - React integration (planned)

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) file

---

## Support

- **Issues**: https://github.com/RudraxDynamics/rudraxone/issues
- **Documentation**: See `docs/` directory
- **Email**: info@tecosys.com

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Credits

Built with:
- [LangChain](https://langchain.com/) - AI agent framework
- [Google Gemini](https://ai.google.dev/) - AI model
- [Frappe Framework](https://frappeframework.com/) - ERPNext platform

---

## Roadmap

- [x] SDK architecture
- [x] Frappe integration
- [x] 11 core tools
- [ ] WordPress integration
- [ ] Shopify integration
- [ ] More AI models (Claude, GPT-4)
- [ ] Voice interface
- [ ] Mobile app
