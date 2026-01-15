# AI Agent Widget - Complete Documentation

> **Powered by Nutaan AI** - Modular AI agent system with autonomous task execution capabilities for ERPNext and beyond.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Setup & Installation](#setup--installation)
6. [Development Workflow](#development-workflow)
7. [Intent Engine](#intent-engine)
8. [Export & Sharing](#export--sharing)
9. [Testing & Verification](#testing--verification)
10. [Troubleshooting](#troubleshooting)
11. [Advanced Topics](#advanced-topics)

---

## Overview

The **AI Agent Platform** is a modular system designed to bring intelligent automation to ERPNext and other web applications. Built with a clean 3-tier architecture, it separates AI logic (SDK), user interface (Widget), and platform integrations (Frappe/ERPNext, future: WordPress, Shopify).

### Key Capabilities

- 🤖 **Autonomous agent** with 11 built-in tools for navigation, form filling, and task execution
- 🎨 **Universal frontend widget** that works on any website
- 🔌 **Platform integrations** starting with ERPNext/Frappe
- 🔒 **Encapsulated core logic** in a reusable Python SDK
- 📱 **Export & Share** - Generate PDF reports and share via WhatsApp/Email
- 🧠 **Intent Engine** - Understands vague requests and asks clarifying questions

### Technology Stack

- **Backend**: Python 3.8+, LangChain, Google Gemini 2.0 Flash
- **Frontend**: Vanilla JavaScript/CSS (no dependencies)
- **Integration**: Frappe Framework (ERPNext)

---

## Architecture

### 3-Tier Modular Design

```
┌─────────────────────────────────────────┐
│         AI Agent Platform               │
└─────────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌──────┐ ┌──────────────┐
│  SDK   │ │Widget│ │Integrations  │
│(Python)│ │(JS)  │ │(Frappe/...)  │
└────────┘ └──────┘ └──────────────┘
```

### Component Breakdown

| Component | Purpose | Location | Technology |
|-----------|---------|----------|------------|
| **SDK** | Core AI logic, tools, agent management | `sdk/` | Python 3.8+ |
| **Widget** | Chat UI, tool visualization | `widget/` | Vanilla JS/CSS |
| **Integration** | Platform wrappers, API endpoints | `integrations/` | Platform-specific |

### Separation of Concerns

- **SDK**: AI logic (hidden, proprietary, reusable)
- **Widget**: UI presentation (portable, no backend knowledge)
- **Integrations**: Platform-specific wrappers (thin layer)

---

## Project Structure

### Complete Directory Tree

```
ai_agent_widget/                    # Project Root
│
├── .git/                          # Git repository
├── .gitignore                     # Git ignore patterns
├── README.md                      # Quick start guide
├── DOCUMENTATION.md               # This file - comprehensive docs
├── LICENSE                        # MIT License
│
├── sdk/                          # 🔒 Backend SDK (Python)
│   ├── nutaan_erp/             # Python package
│   │   ├── __init__.py          # Public API exports
│   │   ├── core/                # Core functionality
│   │   │   ├── __init__.py
│   │   │   ├── agent.py         # AgentManager class (199 lines)
│   │   │   ├── config.py        # AgentConfig dataclass
│   │   │   ├── tools.py         # 11 tool definitions
│   │   │   ├── intent_engine.py # Intent analysis (NEW)
│   │   │   └── tracker.py       # Action tracking (NEW)
│   │   ├── integrations/        # External integrations
│   │   │   ├── __init__.py
│   │   │   └── langchain.py     # LangChain wrapper
│   │   └── utils/               # Utility functions
│   │       ├── __init__.py
│   │       └── context.py       # Context building
│   ├── setup.py                 # SDK packaging
│   ├── requirements.txt         # SDK dependencies
│   └── README.md                # SDK documentation
│
├── widget/                       # 🎨 Frontend Widget (JS/CSS)
│   ├── src/                     # Source files
│   │   ├── widget.js           # Main JavaScript (900+ lines)
│   │   └── widget.css          # Styling (352 lines)
│   ├── dist/                    # Production builds
│   ├── package.json            # Widget metadata
│   └── README.md               # Widget docs
│
├── integrations/                 # 🔌 Platform Integrations
│   └── frappe/                  # ERPNext integration
│       ├── ai_agent_widget/     # Frappe app package
│       │   ├── __init__.py     # App version
│       │   ├── api.py          # Backend API wrapper
│       │   ├── hooks.py        # Frappe hooks config
│       │   ├── export_service.py # PDF export (NEW)
│       │   ├── sharing_service.py # WhatsApp/Email sharing (NEW)
│       │   └── public/         # Frontend assets
│       │       ├── js/widget.js
│       │       └── css/widget.css
│       ├── setup.py            # Frappe app setup
│       └── requirements.txt    # Frappe dependencies
│
└── docs/                        # 📚 Legacy Documentation (archived)
```

### Key File Reference

#### SDK Core Files

- **`agent.py`** (199 lines): Main agent lifecycle management
  - `AgentManager` class
  - `execute(message, context, history)` method
  
- **`tools.py`**: 11 LangChain tool definitions
  - Navigation, form filling, table editing, analysis tools
  
- **`intent_engine.py`**: Psychological intent analysis (NEW)
  - Analyzes user requests before execution
  - Asks clarifying questions when needed
  
- **`tracker.py`**: Action tracking for export feature (NEW)
  - Records all tool executions
  - Generates session summaries

- **`config.py`**: Configuration dataclass
  - API key, model name, temperature, max tokens

#### Widget Files

- **`widget/src/widget.js`** (900+ lines): Complete chat interface
  - `AgenticChatWidget` class
  - Tool execution, screen analysis, export functionality

- **`widget/src/widget.css`** (352 lines): Professional styling
  - Purple gradient theme
  - Responsive design
  - Dark mode compatible

#### Integration Files

- **`integrations/frappe/ai_agent_widget/api.py`**: Frappe API wrapper
  - `agent_stream()` - Main execution endpoint
  - `export_session_pdf()` - PDF generation
  - `share_session_whatsapp()` - WhatsApp sharing
  - `share_session_email()` - Email with PDF attachment

---

## Features

### 🤖 Autonomous Execution

The agent runs in a loop until the task is complete or it determines it needs more information:

1. **User sends request** → Agent analyzes intent
2. **Intent Engine** determines if request is clear
3. **Agent decides tools** needed to accomplish task
4. **Tools execute** on frontend (navigate, fill forms, click buttons)
5. **Agent verifies** results and continues or stops

### 🛠️ 11 Built-in Tools

| # | Tool | Purpose | Example |
|---|------|---------|---------|
| 1 | `navigate` | Navigate to pages/forms | Go to Sales Order list |
| 2 | `create_doc` | Create new documents | Create new Sales Order |
| 3 | `set_field` | Set form field values | Set customer to "ABC Corp" |
| 4 | `click_button` | Click buttons | Click "Save" button |
| 5 | `add_table_row` | Add table rows | Add item row to Sales Order |
| 6 | `set_table_field` | Edit table cells | Set quantity to 10 |
| 7 | `get_field_value` | Read field values | Get current customer name |
| 8 | `select_option` | Select from dropdowns | Select "Pending" status |
| 9 | `analyze_screen` | Understand page state | Analyze current form |
| 10 | `scroll_page` | Scroll up/down | Scroll down 300px |
| 11 | `get_validation_errors` | Check for errors | Get validation errors |

### 🎨 Modern UI Features

- **Floating Action Button**: Purple lightning bolt in bottom-right
- **Chat Window**: Expandable interface with message history
- **Tool Visualization**: Real-time display of tool execution
- **Quick Actions**: Demo, Navigate, Clear, Export buttons
- **Auto-resize Textarea**: Expands as you type
- **Local Storage**: Conversation history persists
- **Professional Branding**: "Nutaan AI" with gradient logo

### 📥 Export & Share Features (NEW)

After completing tasks, users can:

1. **Download PDF Report**
   - Executive summary
   - Detailed action log with timestamps
   - Documents created/modified table
   - Professional Nutaan AI branding

2. **Share via WhatsApp**
   - Creates temporary public link (24hr expiry)
   - Opens WhatsApp Web with pre-filled message

3. **Email PDF**
   - Sends email with PDF attachment
   - Uses Frappe email queue

### 🧠 Intent Engine (NEW)

The Intent Engine analyzes every user request before execution:

#### How it Works

1. **Pre-processing**: Before the main agent runs, `IntentEngine.analyze()` is called
2. **Intent Analysis**: Uses a specialized prompt to determine:
   - Is the request clear?
   - What is the underlying intent?  
   - Is information missing?
3. **Behavior**:
   - **Clear request**: Refines vague requests into technical instructions ("I want to sell stuff" → "Create Sales Order")
   - **Unclear request**: Asks helpful clarification questions ("Which Customer and Item would you like to use?")

#### Example Scenario Handling

| User Input | Old Behavior | New Behavior |
|------------|--------------|--------------|
| "I want to sell stuff" | Error or weird guess | **Asks**: "I can help you create a Sales Order. Which customer and item?" |
| "Create order" | Ambiguous error | **Asks**: "I need to know which Customer and Item you would like." |
| "fdsjkl" | Error/hallucination | **Response**: "I'm not sure I understand. Could you please clarify?" |
| "Create Sales Order for John" | Might fail if "John" isn't exact | **Searches** for "John", picks best match, creates order dynamically |

---

## Setup & Installation

### Prerequisites

- Python 3.8+
- ERPNext/Frappe (for ERPNext integration)
- Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### ERPNext/Frappe Installation (WSL)

#### Step 1: Clone Repository

```bash
# In Windows
cd "d:\COMPANY WORK\TECOSYS"
git clone <repo-url> ai_agent_widget
```

#### Step 2: Setup Symlink in WSL

```bash
# Open WSL
wsl

# Navigate to bench
cd ~/frappe-bench

# Create symlink to Windows directory
ln -s "/mnt/d/COMPANY WORK/TECOSYS/ai_agent_widget" apps/ai_agent_widget

# Verify
ls apps/ai_agent_widget/
```

#### Step 3: Install SDK

```bash
# Install SDK from PyPI
./env/bin/pip install nutaan_erp

# Verify
./env/bin/python -c 'from nutaan_erp import AgentManager; print("SDK OK")'
```

**Expected output**: `SDK OK`

#### Step 4: Create App Symlink

```bash
# Frappe needs the app at root level
cd apps/ai_agent_widget
ln -s integrations/frappe/ai_agent_widget ai_agent_widget

# Verify
ls -la ai_agent_widget
```

#### Step 5: Install Frappe App

```bash
cd ~/frappe-bench

# Install app on site
bench --site mysite.local install-app ai_agent_widget

# Or migrate if already installed
bench --site mysite.local migrate
```

#### Step 6: Configure Gemini API

```bash
# Edit site config
nano sites/mysite.local/site_config.json
```

Add:
```json
{
  "gemini_api_key": "your-gemini-api-key-here",
  "gemini_model": "gemini-2.0-flash-exp"
}
```

Save and exit (Ctrl+X, Y, Enter)

#### Step 7: Build and Restart

```bash
# Build assets
bench build --app ai_agent_widget

# Restart bench
bench restart

# Or start if not running
bench start
```

#### Step 8: Test

1. Open browser: `http://localhost:8000`
2. Login to ERPNext
3. Look for **purple AI button** (bottom-right)
4. Click and try: **"Go to Sales Order"**

### Custom Python Application

```bash
# Install SDK from PyPI
pip install nutaan_erp
```

```python
from nutaan_erp import AgentManager, AgentConfig

# Configure
config = AgentConfig(
    api_key="your-gemini-api-key",
    model_name="gemini-2.0-flash-exp"
)

# Create manager
manager = AgentManager(config)

# Execute
result = manager.execute(
    message="Create a sales order",
    context={"user": "admin", "currentPath": "/"},
    history=[]
)

print(result)
```

### Any Website

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="widget/dist/ai-widget.css">
</head>
<body>
    <h1>My Website</h1>
    
    <script src="widget/dist/ai-widget.js"></script>
    <script>
        // Widget auto-initializes
        // Configure backend endpoint in widget.js
    </script>
</body>
</html>
```

---

## Development Workflow

### Making Changes to SDK

```bash
# 1. Edit SDK files
code apps/ai_agent_widget/sdk/nutaan_erp/core/agent.py

# 2. Changes are immediately available (development mode)
# No reinstall needed

# 3. Restart bench to reload Python
bench restart
```

### Making Changes to Widget

```bash
# 1. Edit source files
code apps/ai_agent_widget/widget/src/widget.js

# 2. Copy to dist/
cp apps/ai_agent_widget/widget/src/widget.js \
   apps/ai_agent_widget/widget/dist/ai-widget.js

# 3. Copy to Frappe public/
cp apps/ai_agent_widget/widget/dist/ai-widget.js \
   apps/ai_agent_widget/integrations/frappe/ai_agent_widget/public/js/

# 4. Rebuild and restart
bench build --app ai_agent_widget
bench restart

# 5. Hard refresh browser (Ctrl+F5)
```

### Making Changes to Frappe Integration

```bash
# 1. Edit wrapper files
code apps/ai_agent_widget/integrations/frappe/ai_agent_widget/api.py

# 2. Migrate and restart
bench --site mysite.local migrate
bench restart
```

### Adding New Tools

1. **Define in SDK** (`sdk/nutaan_erp/core/tools.py`):
```python
@tool
def new_tool(param: str) -> str:
    """Tool description for the AI"""
    return json.dumps({"action": "new_tool", "param": param})
```

2. **Add to tool list**:
```python
def get_all_tools():
    return [..., new_tool]
```

3. **Implement in Widget** (`widget/src/widget.js`):
```javascript
case 'new_tool':
    // Execute the tool on the frontend
    return `✅ Tool executed`;
```

---

## Intent Engine

The Intent Engine is a psychological layer that sits between user input and agent execution.

### Implementation Files

- **`sdk/nutaan_erp/core/intent_engine.py`**: Core intent analysis logic
- **`sdk/nutaan_erp/core/agent.py`**: Integration with AgentManager

### How It Works

```python
# In AgentManager.execute()

# 1. Analyze intent
intent_result = self.intent_engine.analyze(message, context)

# 2. Check if request is clear
if not intent_result['is_clear']:
    # Return clarification question immediately
    return {
        'content': intent_result['suggestion'],
        'needs_clarification': True
    }

# 3. Use refined request if available
refined_message = intent_result.get('refined_request', message)

# 4. Proceed with agent execution
...
```

### Configuration

The Intent Engine uses a specialized system prompt that focuses on:
- Understanding vague or non-technical language
- Identifying missing information
- Generating helpful clarification questions
- Refining requests into technical instructions

### Benefits

✅ **Better UX**: Non-technical users can use natural language  
✅ **Fewer Errors**: Agent doesn't hallucinate missing data  
✅ **Faster Execution**: Clear requests = more efficient tool usage  
✅ **No Hardcoded Scripts**: Uses AI intelligence, not brittle rules

---

## Export & Sharing

### Overview

After the agent completes actions, users can export a professional PDF report and share it via multiple channels.

### Files Involved

- **`sdk/nutaan_erp/core/tracker.py`**: ActionTracker class
- **`integrations/frappe/ai_agent_widget/export_service.py`**: PDF generation
- **`integrations/frappe/ai_agent_widget/sharing_service.py`**: WhatsApp/Email
- **`integrations/frappe/ai_agent_widget/api.py`**: API endpoints

### Features

#### 1. Automatic Action Tracking

All tool executions are automatically recorded with:
- Tool name
- Arguments
- Result/output
- Timestamp
- Execution order

```python
# In AgentManager
self.tracker = ActionTracker()

# During tool execution
self.tracker.record_action(
    tool_name="set_field",
    args={"fieldname": "customer", "value": "ABC Corp"},
    result="✅ Set customer to ABC Corp"
)
```

#### 2. PDF Report Generation

**Endpoint**: `/api/method/ai_agent_widget.api.export_session_pdf`

**Contents**:
- Nutaan AI branding (purple gradient header)
- Executive summary (total actions, duration, documents)
- Detailed action log with timestamps
- Documents created/modified table
- Professional formatting

**File Storage**: `sites/<site>/private/files/ai_agent_sessions/`

#### 3. WhatsApp Sharing

**Endpoint**: `/api/method/ai_agent_widget.api.share_session_whatsapp`

**Flow**:
1. Generate PDF
2. Create public shareable link (24hr expiry)
3. Build WhatsApp URL: `https://wa.me/?text=...`
4. Open WhatsApp Web with pre-filled message

#### 4. Email Sharing

**Endpoint**: `/api/method/ai_agent_widget.api.share_session_email`

**Flow**:
1. Generate PDF
2. Create email with PDF attachment
3. Send via Frappe email queue
4. Returns success confirmation

### Usage in Widget

```javascript
// Export button appears after first action
if (assistantMsg.toolCalls.length > 0) {
    showExportButton();
}

// Click export button
exportButton.on('click', () => {
    const sessionData = {
        actions: this.tracker.getActions(),
        summary: this.tracker.getSummary(),
        documents: this.tracker.getDocuments()
    };
    
    // Show export modal with options
    showExportModal(sessionData);
});
```

### Installation Note

No additional Python packages required! Uses:
- `frappe.utils.pdf` (built-in)
- `frappe.sendmail` (built-in)
- Standard library only

---

## Testing & Verification

### Production Test Commands

Run these commands in order to verify the system:

1. **Capabilities Check**
   - "What can you do?"

2. **Navigation Tests**
   - "Go to the Item list"
   - "Analyze this screen"
   - "Go to Home"
   - "Scroll down"

3. **Intent Engine Tests**
   - "Create a sales order" (should ask for details)
   - "I want to sell something" (should clarify)
   - "Transform this photo into a professional portrait" (should reject gracefully)
   - "blue sky" (should ask to clarify)

4. **Data Validation Tests**
   - "Create a Sales Order for 'NonExistentCustomer'" (should fail gracefully)
   - "Check if Item 'TEST-ITEM-001' exists" (should search)

5. **Complex Workflows**
   - "Create a Sales Order for Customer 'Aditya'"
   - "Add a new item row"
   - "Set the delivery date to 2 Feb" (should pick FUTURE date)
   - "Click Save"
   - "Click the Submit button"

6. **Summary Test**
   - "Summarize what we just did"

### Expected Behaviors

✅ **Clear Navigation**: Agent should navigate correctly  
✅ **Smart Clarification**: Asks questions for vague requests  
✅ **Graceful Failures**: Shows helpful errors for invalid data  
✅ **Date Intelligence**: Picks future dates when appropriate  
✅ **Validation Awareness**: Detects and reports form errors

### Verification Checklist

- [ ] AI agent performs actions successfully
- [ ] Export button appears after first action
- [ ] Export modal shows correct summary
- [ ] Download PDF works and opens correctly
- [ ] PDF contains all actions with timestamps
- [ ] WhatsApp button opens with message
- [ ] Email sends with PDF attachment
- [ ] Intent Engine asks clarifying questions
- [ ] Agent handles invalid data gracefully

---

## Troubleshooting

### Issue: SDK Not Found

**Error**: `ModuleNotFoundError: No module named 'nutaan_erp'`

**Solution**:
```bash
cd ~/frappe-bench
./env/bin/pip install nutaan_erp
bench restart
```

### Issue: Widget Not Appearing

**Error**: No purple button visible

**Solution**:
```bash
# Clear cache
bench --site mysite.local clear-cache

# Rebuild assets
bench build --app ai_agent_widget

# Restart
bench restart

# Hard refresh browser (Ctrl+F5)
```

### Issue: App Not Found

**Error**: `No module named 'ai_agent_widget'`

**Solution**:
Create symlink at app root:
```bash
cd ~/frappe-bench/apps/ai_agent_widget
ln -s integrations/frappe/ai_agent_widget ai_agent_widget
```

### Issue: Import Error in api.py

**Error**: `cannot import name 'AgentManager'`

**Solution**:
SDK not installed properly:
```bash
./env/bin/pip uninstall nutaan_erp -y
./env/bin/pip install nutaan_erp
bench restart
```

### Issue: PDF Not Generating

**Symptoms**: Export feature fails

**Solutions**:
1. Check Frappe error log: `bench --site <site> logs`
2. Verify files directory exists: `sites/<site>/private/files/ai_agent_sessions/`
3. Test PDF library: `./env/bin/python -c "from frappe.utils.pdf import get_pdf; print('OK')"`

### Issue: Email Not Sending

**Symptoms**: Email sharing doesn't work

**Solutions**:
1. Check email queue: Frappe → Email Queue
2. Verify email settings in `site_config.json`
3. Check Frappe email account setup

---

## Advanced Topics

### Data Flow

```
User Input
    ↓
Widget (JS)
    ↓
Intent Engine (analyze)
    ├── Clear? → Continue
    └── Unclear? → Ask question
        ↓
HTTP POST /api/agent_stream
    ↓
Integration Layer (api.py)
    ├── Extract context
    ├── Build configuration
    └── Call SDK
        ↓
    SDK (AgentManager)
        ├── Initialize LangChain
        ├── Execute tools
        ├── Track actions
        └── Return results
            ↓
        Widget (Display + Execute)
            ↓
        User sees results
```

### Security Considerations

- **API Keys**: Stored in configuration, not in code
- **CSRF Protection**: Widget uses Frappe CSRF tokens
- **XSS Protection**: All user input is escaped
- **Authentication**: Respects Frappe user permissions
- **Whitelisted Endpoints**: Only approved API methods accessible

### Performance Metrics

- **SDK initialization**: < 100ms
- **Tool execution**: < 500ms per tool
- **Full agent loop**: 2-5 seconds (typical)
- **SDK memory**: ~50MB
- **Widget size**: ~100KB (JS + CSS)

### Scalability

- **Stateless SDK**: Can run multiple instances
- **Horizontal Scaling**: Load balancer compatible
- **Caching**: Tool definitions and prompts cached
- **Async Execution**: Streaming responses, no blocking

### Future Roadmap

- [ ] WordPress integration
- [ ] Shopify integration
- [ ] Claude AI support
- [ ] GPT-4 support
- [ ] Voice interface
- [ ] Mobile app (React Native)
- [ ] Persistent session storage (DocTypes)
- [ ] Analytics dashboard
- [ ] Custom PDF templates

---

## Quick Reference

### Key Commands

```bash
# SDK Installation
./env/bin/pip install nutaan_erp

# Build Assets
bench build --app ai_agent_widget

# Restart Server
bench restart

# Clear Cache
bench --site mysite.local clear-cache

# View Logs
bench --site mysite.local logs
```

### Import Paths

```python
# SDK (from anywhere after installation)
from nutaan_erp import AgentManager, AgentConfig
from nutaan_erp.utils import build_frappe_context
from nutaan_erp.core import ActionTracker, IntentEngine
```

### API Endpoints

- `/api/method/ai_agent_widget.api.agent_stream` - Main execution
- `/api/method/ai_agent_widget.api.export_session_pdf` - Export PDF
- `/api/method/ai_agent_widget.api.share_session_whatsapp` - WhatsApp share
- `/api/method/ai_agent_widget.api.share_session_email` - Email PDF

---

## Summary

**Project**: Production-ready AI agent for ERPNext  
**Architecture**: Clean 3-tier modular design  
**SDK**: 800+ lines of encapsulated AI logic  
**Widget**: 1200+ lines of professional frontend  
**Integration**: Thin Frappe wrapper  
**Status**: ✅ **Production Ready**

---

*Last Updated: 2026-01-15*  
*Version: 1.0.0*  
*Powered by Nutaan AI*
