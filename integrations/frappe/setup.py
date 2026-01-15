from setuptools import setup, find_packages

# Read wrapper requirements
install_requires = [
    "frappe",
    "ai-agent-sdk>=0.1.0"
]

setup(
    name="ai_agent_widget",
    version="0.1.0",
    description="AI Agent Widget for ERPNext - Frappe Integration",
    author="Tecosys",
    author_email="info@tecosys.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires,
    python_requires=">=3.8",
)
