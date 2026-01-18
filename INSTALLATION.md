# RudraX One - AI Agent Widget for ERPNext

Complete installation guide for integrating RudraX One AI Agent into your ERPNext instance.

## Prerequisites

- ERPNext/Frappe v13, v14, or v15 installed and running
- Python 3.10 or higher
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## Installation (Local Bench)

### Step 1: Get the App

```bash
cd ~/frappe-bench
bench get-app https://github.com/RudraxDynamics/rudraxone
```

### Step 2: Install on Site

```bash
bench --site [your-site-name] install-app ai_agent_widget
```

### Step 3: Configure API Key

```bash
bench --site [your-site-name] set-config gemini_api_key "YOUR_GEMINI_API_KEY"
bench --site [your-site-name] set-config gemini_model "gemini-2.0-flash-exp"
```

### Step 4: Restart

```bash
bench restart
```

---

## Installation (Docker)

### Step 1: Enter Container

```bash
sudo docker exec -it [backend-container-name] bash
cd /home/frappe/frappe-bench
```

### Step 2: Get the App

```bash
bench get-app https://github.com/RudraxDynamics/rudraxone
```

### Step 3: Install on Site

```bash
bench --site [your-site-name] install-app ai_agent_widget
```

### Step 4: Configure API Key

```bash
bench --site [your-site-name] set-config gemini_api_key "YOUR_GEMINI_API_KEY"
bench --site [your-site-name] set-config gemini_model "gemini-2.0-flash-exp"
exit
```

### Step 5: Restart Containers

```bash
sudo docker restart [backend-container] [nginx-container]
```

---

## Verification

1. Open your browser and navigate to your ERPNext site
2. Log in with your credentials
3. Look for the **purple lightning button** in the bottom-right corner
4. Click it and try: "Show me the Sales Order list"

### Check Installation

```bash
bench --site [your-site-name] list-apps
# Should show: ai_agent_widget
```

---

## Uninstallation (Local Bench)

```bash
cd ~/frappe-bench

# Step 1: Uninstall from site
bench --site [your-site-name] uninstall-app ai_agent_widget --yes

# Step 2: Remove app
bench remove-app ai_agent_widget

# Step 3: Restart
bench restart
```

---

## Uninstallation (Docker)

### Step 1: Inside Container

```bash
sudo docker exec -it [backend-container-name] bash
cd /home/frappe/frappe-bench

# Uninstall from site
bench --site [your-site-name] uninstall-app ai_agent_widget --yes

# Update apps.txt BEFORE deleting files (important!)
echo -e 'frappe\nerpnext' > sites/apps.txt

# Remove app files
rm -rf apps/ai_agent_widget apps/rudraxone

exit
```

### Step 2: Restart Containers

```bash
sudo docker restart [backend-container] [nginx-container] [scheduler-container] [worker-containers]
```

---

## Updating

### Local Bench

```bash
cd ~/frappe-bench/apps/ai_agent_widget
git pull origin main
cd ~/frappe-bench
bench --site [your-site-name] migrate
bench build --app ai_agent_widget
bench restart
```

### Docker

```bash
sudo docker exec -it [backend-container-name] bash
cd /home/frappe/frappe-bench/apps/ai_agent_widget
git pull origin main
cd /home/frappe/frappe-bench
bench --site [your-site-name] migrate
bench build --app ai_agent_widget
exit

sudo docker restart [backend-container] [nginx-container]
```

---

## Troubleshooting

### Widget Not Appearing

```bash
bench --site [your-site-name] clear-cache
bench build --app ai_agent_widget
bench restart
```

Also **hard refresh browser**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Clear Old Chat Messages

Run in browser console:
```javascript
localStorage.removeItem('frappe_ai_agent_messages');
location.reload();
```

### Check API Key

```bash
bench --site [your-site-name] console
>>> import frappe
>>> print(frappe.conf.get('gemini_api_key'))
```

---

## Usage Examples

| Command | Action |
|---------|--------|
| "Go to Sales Order" | Navigate to page |
| "Create a new Customer" | Create new document |
| "Set customer name to ABC Corp" | Fill form fields |
| "Show me what's on this page" | Analyze page content |

---

## Support

- **Issues:** https://github.com/RudraxDynamics/rudraxone/issues
- **Email:** info@tecosys.com
- **Website:** https://nutaan.com

---

**Powered by Nutaan AI** | Version 1.0.0 | January 2026