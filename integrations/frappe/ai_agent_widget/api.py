"""
AI Agent Widget API - Thin wrapper around nutaan_erp

This module provides Frappe-specific integration for the Nutaan ERP SDK.
All core functionality is handled by the SDK package.
"""

import frappe
from frappe import _
import json

try:
    from nutaan_erp import AgentManager, AgentConfig
    from nutaan_erp.utils import build_frappe_context
    HAS_SDK = True
except ImportError:
    HAS_SDK = False

# Import export and sharing services
from . import export_service
from . import sharing_service

@frappe.whitelist(allow_guest=False)
def agent_stream():
    """
    AI Agent endpoint for Frappe/ERPNext.
    
    This is a thin wrapper that:
    1. Extracts Frappe-specific data (user, roles, config)
    2. Builds context using SDK utilities
    3. Delegates execution to SDK's AgentManager
    4. Returns results to frontend
    """
    
    # Check if SDK is installed
    if not HAS_SDK:
        frappe.throw(_(
            "AI Agent SDK not installed. "
            "Please install with: pip install -e ./ai_agent_sdk"
        ))
    
    # Get request data
    data = json.loads(frappe.request.data)
    message = data.get("message", "")
    request_context = data.get("context", {})
    conversation_history = data.get("history", [])
    
    # Get Frappe site configuration
    api_key = frappe.conf.get("gemini_api_key")
    model_name = frappe.conf.get("gemini_model", "gemini-2.0-flash-exp")
    
    if not api_key:
        return {
            "error": "Gemini API key not configured in site_config.json",
            "success": False
        }
    
    try:
        # Create SDK configuration
        config = AgentConfig(
            api_key=api_key,
            model_name=model_name,
            temperature=0.1,
            max_tokens=4000
        )
        
        # Get user information
        user = frappe.get_doc("User", frappe.session.user)
        roles = frappe.get_roles(frappe.session.user)
        
        # Build context using SDK utility
        context = build_frappe_context(
            user=frappe.session.user,
            current_path=request_context.get('currentPath', '/'),
            roles=roles,
            user_full_name=user.full_name
        )
        
        # Create agent manager and execute
        manager = AgentManager(config)
        result = manager.execute(
            message=message,
            context=context,
            history=conversation_history
        )
        
        return result
        
    except Exception as e:
        # Log error for debugging
        frappe.log_error(
            f"AI Agent Error: {str(e)}",
            "AI Agent Widget"
        )
        
        import traceback
        return {
            "error": str(e),
            "success": False,
            "traceback": traceback.format_exc()
        }


@frappe.whitelist(allow_guest=False)
def export_session_pdf(session_data):
    """
    Export session data as PDF
    
    Args:
        session_data: JSON string of session data from frontend
        
    Returns:
        dict with success status
    """
    try:
        # Parse session data
        if isinstance(session_data, str):
            session_data = json.loads(session_data)
        
        session_id = session_data.get('session_id', 'unknown')
        
        # Generate PDF
        pdf_bytes = export_service.generate_session_pdf(session_data)
        
        # Save PDF to temporary storage using Frappe cache
        import hashlib
        import time
        temp_key = hashlib.md5(f"{session_id}_{time.time()}".encode()).hexdigest()
        
        # Store in cache (will be manually deleted after download)
        frappe.cache().set_value(f"pdf_{temp_key}", pdf_bytes)
        
        return {
            "success": True,
            "temp_key": temp_key,
            "session_id": session_id
        }
        
    except Exception as e:
        frappe.log_error(f"Error exporting PDF: {str(e)}", "AI Agent Export")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist(allow_guest=False)
def download_session_pdf(session_id):
    """
    Download PDF as blob (returns raw PDF bytes)
    
    Args:
        session_id: Session ID to download PDF for
        
    Returns:
        PDF bytes as response
    """
    try:
        # Get temp key from previous export call
        # For now, generate PDF on demand
        # In production, retrieve from cache if available
        
        # This is a simplified approach - in real use, session_data should be passed
        # For now, we'll use the fact that frontend calls export first, then download
        
        # Check cache first
        temp_key = frappe.request.json.get('temp_key') if hasattr(frappe.request, 'json') else None
        
        if temp_key:
            pdf_bytes = frappe.cache().get_value(f"pdf_{temp_key}")
            if pdf_bytes:
                # Don't delete - allow multiple downloads
                frappe.local.response.filename = f"Nutaan_AI_Report_{session_id[:8]}.pdf"
                frappe.local.response.filecontent = pdf_bytes
                frappe.local.response.type = "pdf"
                return
        
        # Fallback: should not reach here in normal flow
        return {
            "success": False,
            "error": "PDF not found. Please try exporting again."
        }
        
    except Exception as e:
        frappe.log_error(f"Error downloading PDF: {str(e)}", "AI Agent Export")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist(allow_guest=False)
def share_session_whatsapp(session_data):
    """
    Generate WhatsApp share link for session report
    
    Args:
        session_data: JSON string of session data from frontend
        
    Returns:
        dict with WhatsApp URL
    """
    try:
        # Parse session data
        if isinstance(session_data, str):
            session_data = json.loads(session_data)
        
        session_id = session_data.get('session_id', 'unknown')
        
        # Generate and save PDF
        pdf_bytes = export_service.generate_session_pdf(session_data)
        pdf_path = export_service.save_session_pdf(session_id, pdf_bytes)
        
        # Create shareable link
        pdf_url = export_service.create_shareable_link(session_id, pdf_path)
        
        # Generate WhatsApp URL
        whatsapp_url = sharing_service.share_via_whatsapp(session_id, pdf_url)
        
        return {
            "success": True,
            "whatsapp_url": whatsapp_url,
            "pdf_url": pdf_url
        }
        
    except Exception as e:
        frappe.log_error(f"Error sharing via WhatsApp: {str(e)}", "AI Agent Sharing")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist(allow_guest=False)
def share_session_email(session_data, to_email):
    """
    Send session report via email
    
    Args:
        session_data: JSON string of session data from frontend
        to_email: Recipient email address
        
    Returns:
        dict with success status
    """
    try:
        # Parse session data
        if isinstance(session_data, str):
            session_data = json.loads(session_data)
        
        session_id = session_data.get('session_id', 'unknown')
        
        # Generate and save PDF
        pdf_bytes = export_service.generate_session_pdf(session_data)
        pdf_path = export_service.save_session_pdf(session_id, pdf_bytes)
        
        # Get session summary for email
        from datetime import datetime
        start_time = session_data.get('start_time', '')
        end_time = session_data.get('end_time', '')
        
        duration_seconds = 0
        if start_time and end_time:
            start = datetime.fromisoformat(start_time)
            end = datetime.fromisoformat(end_time)
            duration_seconds = int((end - start).total_seconds())
        
        session_summary = {
            'session_id': session_id,
            'total_actions': session_data.get('total_actions', 0),
            'duration_seconds': duration_seconds,
            'initial_message': session_data.get('initial_message', 'N/A')
        }
        
        # Send email
        success = sharing_service.share_via_email(
            session_id,
            to_email,  
            session_summary,
            pdf_path
        )
        
        return {
            "success": success,
            "message": "Email queued for sending" if success else "Failed to queue email"
        }
        
    except Exception as e:
        frappe.log_error(f"Error sharing via email: {str(e)}", "AI Agent Sharing")
        return {
            "success": False,
            "error": str(e)
        }

