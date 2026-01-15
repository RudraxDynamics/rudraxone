# Nutaan AI Agent - ERPNext Integration Guide

Complete installation guide for integrating Nutaan AI Agent into your ERPNext instance.

## Prerequisites

- ERPNext/Frappe installed and running
- Python 3.8 or higher
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation Steps

### Step 1: Navigate to Frappe Bench

```bash
cd ~/frappe-bench
```

### Step 2: Get the Frappe App

Clone or download the repository:

```bash
# Option 1: Clone from repository
git clone https://github.com/RudraxDynamics/rudraxone.git apps/rudraxone

# Option 2: If you have the files locally
# Just ensure they're in apps/rudraxone/integrations/frappe
```

Create app symlink:

```bash
cd apps/rudraxone
ln -s integrations/frappe ai_agent_widget
cd ~/frappe-bench
```

### Step 3: Install the App

Install on your site:

```bash
bench --site [your-site-name] install-app ai_agent_widget
```

Replace `[your-site-name]` with your actual site name (e.g., `mysite.local`).

During installation, the system will automatically:
- ✅ Install `nutaan_erp` package from PyPI
- ✅ Install all dependencies (LangChain, Google Gemini AI, etc.)
- ✅ Set up the widget assets

### Step 4: Configure Gemini API Key

Edit your site configuration:

```bash
nano sites/[your-site-name]/site_config.json
```

Add the following:

```json
{
  "gemini_api_key": "your-gemini-api-key-here",
  "gemini_model": "gemini-2.0-flash-exp"
}
```

**Get Your API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and paste into site_config.json

Save and exit (Ctrl+X, Y, Enter).

### Step 5: Build and Restart

Build the app assets:

```bash
bench build --app ai_agent_widget
```

Restart the bench:

```bash
bench restart
```

## Verification

### Check Installation

1. **Verify Package Installation:**
   ```bash
   ./env/bin/python -c "from nutaan_erp import AgentManager; print('✅ Nutaan ERP SDK installed successfully')"
   ```

2. **Check App Status:**
   ```bash
   bench --site [your-site-name] list-apps
   ```
   
   You should see `ai_agent_widget` in the list.

### Verification

1. Open your browser and navigate to your ERPNext site
2. Log in with your credentials
3. Look for the **purple lightning button** in the bottom-right corner
4. Click the button to open the AI assistant
5. Try: "Show me the Sales Order list"

The AI should respond and navigate to the Sales Order list.

## Usage Examples

### Simple Commands
```
"Show me all customers"
"Go to Sales Order"
"Create a new customer"
```

### Complex Tasks
```
"Create a Sales Order for ABC Corp with 5 units of Product-001"

The AI will automatically:
- Find the customer
- Create the document
- Add the items
- Set quantities
- Save everything
```

### Smart Assistance
```
"I want to create an invoice"

The AI will ask clarifying questions:
- Which customer?
- Which items?
- What quantities?
```

## What Can It Do?

### 🤖 Intelligent Automation
- Understands natural language commands
- Executes multi-step workflows automatically
- Asks questions when more information is needed
- Self-corrects when encountering errors

### 📋 Document Management
- Create any type of document (Sales Order, Invoice, Customer, etc.)
- Fill in form fields
- Add items to tables
- Save and submit documents

### 🔍 Navigation & Search
- Navigate to any page in ERPNext
- Search for customers, items, or records
- Filter and find data quickly

### ✅ Data Validation
- Checks for errors before saving
- Validates required fields
- Ensures data integrity

### 📊 Reports & Export
- Generate session reports
- Export actions as PDF
- Share results via WhatsApp or Email

## Troubleshooting

### AI Assistant Not Appearing

**Clear cache and rebuild:**
```bash
bench --site [your-site-name] clear-cache
bench build --app ai_agent_widget
bench restart
```

**Hard refresh browser:** Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)

### API Key Not Working

**Verify configuration:**
```bash
bench --site [your-site-name] console
```

In the console:
```python
import frappe
print(frappe.conf.get('gemini_api_key'))
# Should print your API key
```

### Package Installation Issues

**Reinstall the package:**
```bash
./env/bin/pip install --upgrade nutaan_erp
bench restart
```

### AI Not Responding

**Check logs:**
```bash
bench --site [your-site-name] logs
```

Look for errors related to API key or network connectivity.

## Updating

### Update to Latest Version

```bash
# Update the app
cd ~/frappe-bench/apps/rudraxone
git pull origin main

# Update the SDK from PyPI
./env/bin/pip install --upgrade nutaan_erp

# Migrate and restart
cd ~/frappe-bench
bench --site [your-site-name] migrate
bench build --app ai_agent_widget
bench restart
```

### Check Current Version

```bash
./env/bin/python -c "import nutaan_erp; print(f'Nutaan ERP v{nutaan_erp.__version__}')"
```

## Uninstallation

If you need to remove the app:

```bash
# Uninstall from site
bench --site [your-site-name] uninstall-app ai_agent_widget

# Remove the app
rm -rf apps/rudraxone
rm -rf apps/ai_agent_widget

# Uninstall SDK package
./env/bin/pip uninstall nutaan_erp -y

# Restart
bench restart
```

## Production Deployment

### Security Considerations

1. **API Key Protection:**
   - Never commit API keys to version control
   - Use environment variables or secure vaults
   - Rotate keys periodically

2. **User Permissions:**
   - Agent respects ERPNext user roles
   - Only performs actions user is authorized for
   - No privilege escalation possible

3. **Rate Limiting:**
   - Be aware of Gemini API rate limits
   - Monitor usage in Google Cloud Console

### Performance Optimization

1. **Caching:**
   ```bash
   # Enable Redis caching
   bench --site [your-site-name] set-config redis_cache "redis://localhost:6379"
   ```

2. **Worker Configuration:**
   ```bash
   # Increase workers for better performance
   bench --site [your-site-name] set-config gunicorn_workers 4
   ```

### Monitoring

**View agent usage logs:**
```bash
bench --site [your-site-name] logs
```

**Monitor performance:**
```bash
bench --site [your-site-name] doctor
```

## Support

### Resources
- **Package:** https://pypi.org/project/nutaan-erp/
- **Documentation:** [DOCUMENTATION.md](../../DOCUMENTATION.md)
- **Issues:** https://github.com/RudraxDynamics/rudraxone/issues

### Contact
- **Email:** hara@nutaan.com
- **Website:** https://nutaan.com

## FAQ

**Q: Does this work with ERPNext version X?**
A: Compatible with ERPNext v13, v14, and v15. Requires Frappe Framework.

**Q: Can I use this with other ERP systems?**
A: Currently designed for ERPNext. Widget can be adapted for other systems.

**Q: Is my data secure?**
A: Yes. Agent runs locally on your server. Only prompts are sent to Gemini API.

**Q: How much does Gemini API cost?**
A: Gemini 2.0 Flash is free for moderate usage. Check [Google AI pricing](https://ai.google.dev/pricing).

**Q: Can I customize the agent's behavior?**
A: Yes. Modify system prompts in the SDK or create custom tools.

**Q: Does it work offline?**
A: No. Requires internet connection for Gemini API calls.

## License

MIT License - See [LICENSE](../../LICENSE) file.

---

**Powered by Nutaan AI** | Version 1.0.1 | January 2026
AI's behavior?**
A: Yes. Contact support for customization option