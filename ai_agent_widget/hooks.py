from . import __version__ as app_version

app_name = "ai_agent_widget"
app_title = "AI Agent Widget"
app_publisher = "Tecosys"
app_description = "AI Agent Widget for ERPNext - Autonomous navigation and task execution"
app_icon = "octicon octicon-zap"
app_color = "purple"
app_email = "info@tecosys.com"
app_license = "MIT"

# Apps to include JS / CSS assets
app_include_js = [
    "/assets/ai_agent_widget/js/widget.js"
]

app_include_css = [
    "/assets/ai_agent_widget/css/widget.css"
]

# Include JS at page level (loaded on every page)
page_js = {
    "**": "public/js/widget.js"
}

# Frappe Configuration
# ---------------------------------------------------------

# Allow all roles to access the widget
override_whitelisted_methods = {
    "ai_agent_widget.api.agent_stream": "ai_agent_widget.api.agent_stream"
}

# Website Settings
website_route_rules = []

# Scheduled Tasks
scheduler_events = {}

# Testing
before_tests = []

# Installation
before_install = []
after_install = []

# Uninstallation
before_uninstall = []
after_uninstall = []

# Desk Notifications
notification_config = "ai_agent_widget.notifications.get_notification_config"
