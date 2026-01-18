from setuptools import setup, find_packages

# Read wrapper requirements
install_requires = [
    "nutaan-erp>=1.0.0"
]

setup(
    name="ai_agent_widget",
    version="1.0.0",
    description="AI Agent Widget for ERPNext - Autonomous navigation and task execution",
    author="Tecosys",
    author_email="info@tecosys.in",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires,
    python_requires=">=3.10",
)

