"""
Sharing Service for AI Agent Widget

Handles WhatsApp and Email sharing of session reports.
"""

import frappe
from frappe import _
from frappe.utils import get_url
from urllib.parse import quote
from typing import Dict, Any


def share_via_whatsapp(session_id: str, pdf_url: str) -> str:
    """
    Generate WhatsApp share URL
    
    Args:
        session_id: Session ID
        pdf_url: Public URL to PDF
        
    Returns:
        WhatsApp Web URL
    """
    message = f"""Hi! Here's my Nutaan AI session report.

Session ID: {session_id}

View Report: {pdf_url}

Powered by RudraX One - AI Agent for ERPNext"""
    
    # Encode message for URL
    encoded_message = quote(message)
    
    # Generate WhatsApp URL
    whatsapp_url = f"https://wa.me/?text={encoded_message}"
    
    return whatsapp_url


def share_via_email(session_id: str, to_email: str, session_summary: Dict[str, Any], pdf_path: str) -> bool:
    """
    Send session report via email
    
    Args:
        session_id: Session ID
        to_email: Recipient email address
        session_summary: Session summary data
        pdf_path: Path to PDF file
        
    Returns:
        True if email queued successfully
    """
    try:
        # Get session details
        total_actions = session_summary.get('total_actions', 0)
        duration = session_summary.get('duration_seconds', 0)
        initial_message = session_summary.get('initial_message', 'N/A')
        
        # Format duration
        minutes = duration // 60
        seconds = duration % 60
        duration_text = f"{minutes}m {seconds}s" if minutes > 0 else f"{seconds}s"
        
        # Create email content
        subject = f"Nutaan AI Session Report - {session_id[:8]}"
        
        message = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); 
                          color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .header h1 {{ margin: 0; font-size: 24px; }}
                .header p {{ margin: 5px 0 0 0; opacity: 0.9; }}
                .content {{ background: #f8f4ff; padding: 30px; }}
                .summary {{ background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
                .summary-item {{ margin: 10px 0; }}
                .summary-label {{ font-weight: bold; color: #8b5cf6; }}
                .cta {{ text-align: center; margin: 30px 0; }}
                .cta a {{ background: #8b5cf6; color: white; padding: 12px 30px; 
                         text-decoration: none; border-radius: 5px; display: inline-block; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🤖 Nutaan AI Session Report</h1>
                    <p>Powered by RudraX One</p>
                </div>
                <div class="content">
                    <div class="summary">
                        <h2 style="color: #8b5cf6; margin-top: 0;">Session Summary</h2>
                        <div class="summary-item">
                            <span class="summary-label">Session ID:</span> {session_id}
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Initial Request:</span> {initial_message}
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Actions Performed:</span> {total_actions}
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Duration:</span> {duration_text}
                        </div>
                    </div>
                    
                    <p>Your AI agent session report is attached to this email. The report contains:</p>
                    <ul>
                        <li>Complete action log with timestamps</li>
                        <li>Documents created and modified</li>
                        <li>Detailed execution summary</li>
                    </ul>
                    
                    <div class="cta">
                        <p style="color: #666;">View the attached PDF for the complete report</p>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>Nutaan AI</strong> - Intelligent Automation for ERPNext</p>
                    <p>Generated on {frappe.utils.now_datetime().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Get PDF file
        full_pdf_path = frappe.get_site_path(pdf_path.lstrip('/'))
        
        # Send email with attachment
        frappe.sendmail(
            recipients=[to_email],
            subject=subject,
            message=message,
            attachments=[{
                'fname': f'AI_Session_Report_{session_id[:8]}.pdf',
                'fcontent': open(full_pdf_path, 'rb').read()
            }],
            now=False  # Queue for sending
        )
        
        return True
        
    except Exception as e:
        frappe.log_error(f"Error sending email for session {session_id}: {str(e)}", "AI Agent Sharing")
        return False


def cleanup_expired_links():
    """
    Clean up public File documents older than 24 hours
    Should be run as a scheduled job
    """
    try:
        from frappe.utils import add_to_date, now_datetime
        
        # Find files older than 24 hours
        expiry_time = add_to_date(now_datetime(), hours=-24)
        
        old_files = frappe.get_all(
            'File',
            filters={
                'file_name': ['like', 'AI_Session_Report_%'],
                'creation': ['<', expiry_time],
                'is_private': 0
            },
            pluck='name'
        )
        
        # Delete files
        for file_name in old_files:
            frappe.delete_doc('File', file_name, ignore_permissions=True)
        
        frappe.db.commit()
        
    except Exception as e:
        frappe.log_error(f"Error cleaning up expired links: {str(e)}", "AI Agent Sharing")
