"""
Export Service for AI Agent Widget

Professional PDF report generation for AI conversations.
Clean, minimal format with clear user request / agent action separation.
Includes summary section at the end.
"""

import frappe
from frappe.utils.pdf import get_pdf
from frappe.utils import now_datetime
from datetime import datetime
from typing import Dict, List, Any


def generate_conversation_report_html(conversation_data: Dict[str, Any]) -> str:
    """
    Generate professional HTML report for AI conversation
    
    Args:
        conversation_data: Full conversation data with messages array
        
    Returns:
        Clean, professional HTML ready for PDF conversion
    """
    messages = conversation_data.get('messages', [])
    
    # Group messages by user request and track summary data
    conversation_blocks = []
    current_block = None
    total_actions = 0
    documents_created = []
    all_doctypes = set()
    
    for msg in messages:
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        tool_calls = msg.get('toolCalls', [])
        timestamp = msg.get('timestamp', '')
        
        if role == 'user':
            # Start new conversation block
            if current_block:
                conversation_blocks.append(current_block)
            
            current_block = {
                'user_request': content,
                'timestamp': timestamp,
                'actions': [],
                'ai_response': ''
            }
        
        elif role == 'assistant' and current_block:
            # Add AI response and actions to current block
            if content and content.strip():
                current_block['ai_response'] = content
            
            if tool_calls:
                for tc in tool_calls:
                    action = {
                        'name': tc.get('name', 'Unknown'),
                        'args': tc.get('args', {}),
                        'result': tc.get('result', '')
                    }
                    current_block['actions'].append(action)
                    total_actions += 1
                    
                    # Track documents and doctypes
                    args = action['args']
                    result_str = str(action['result'])
                    
                    if 'doctype' in args:
                        all_doctypes.add(args['doctype'])
                    
                    # Detect document creation
                    if action['name'] == 'create_doc' and '✅' in result_str:
                        doc_detail = f"New {args.get('doctype', 'Document')}"
                        if doc_detail not in [d['detail'] for d in documents_created]:
                            documents_created.append({
                                'doctype': args.get('doctype', 'Unknown'),
                                'detail': doc_detail
                            })
    
    # Add last block
    if current_block:
        conversation_blocks.append(current_block)
    
    # Build conversation HTML
    conversation_html = ""
    
    for idx, block in enumerate(conversation_blocks, 1):
        timestamp = block.get('timestamp', '')
        try:
            dt = datetime.fromisoformat(timestamp) if timestamp else None
            time_display = dt.strftime('%I:%M %p') if dt else ''
        except:
            time_display = ''
        
        # User Request Section
        conversation_html += f"""
        <div class="conversation-block">
            <div class="request-section">
                <div class="request-header">
                    <span class="request-number">Request #{idx}</span>
                    <span class="timestamp">{time_display}</span>
                </div>
                <div class="request-content">{_escape_html(block['user_request'])}</div>
            </div>
        """
        
        # Agent Actions Section
        if block['actions']:
            conversation_html += '<div class="actions-section">'
            conversation_html += '<div class="actions-header">Agent Actions:</div>'
            
            for action in block['actions']:
                tool_name = action['name']
                args = action['args']
                result = str(action['result'])
                
                # Determine status
                if '✅' in result:
                    status = 'success'
                    icon = '✅'
                elif '❌' in result:
                    status = 'error'
                    icon = '❌'
                else:
                    status = 'info'
                    icon = '⚡'
                
                # Format action details
                details = _format_action_details(tool_name, args)
                
                conversation_html += f"""
                <div class="action {status}">
                    <div class="action-name">{icon} {_format_tool_name(tool_name)}</div>
                    {f'<div class="action-details">{details}</div>' if details else ''}
                    <div class="action-result">{_escape_html(result)}</div>
                </div>
                """
            
            conversation_html += '</div>'
        
        # AI Response (if any meaningful text)
        if block.get('ai_response') and block['ai_response'].strip():
            conversation_html += f"""
            <div class="ai-response">
                <div class="response-label">Summary:</div>
                <div class="response-text">{_escape_html(block['ai_response'])}</div>
            </div>
            """
        
        conversation_html += '</div>'
    
    # Build summary section
    summary_html = _generate_summary_section(
        total_actions,
        documents_created,
        list(all_doctypes),
        conversation_blocks
    )
    
    # Generate current date
    current_date = now_datetime().strftime('%B %d, %Y')
    current_time = now_datetime().strftime('%I:%M %p UTC')
    
    # Build complete HTML
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @page {{
                size: A4;
                margin: 20mm 15mm;
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                color: #1a1a1a;
                line-height: 1.6;
                font-size: 10pt;
            }}
            
            .header {{
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
                margin-bottom: 30px;
            }}
            
            .header h1 {{
                margin: 0;
                font-size: 18pt;
                font-weight: 600;
                color: #1a1a1a;
            }}
            
            .header .subtitle {{
                color: #666;
                font-size: 9pt;
                margin-top: 5px;
            }}
            
            .conversation-block {{
                margin-bottom: 30px;
                page-break-inside: avoid;
            }}
            
            .request-section {{
                background: #f8f9fa;
                border-left: 4px solid #2563eb;
                padding: 15px;
                margin-bottom: 15px;
            }}
            
            .request-header {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }}
            
            .request-number {{
                font-weight: 700;
                color: #2563eb;
                font-size: 10pt;
            }}
            
            .timestamp {{
                color: #999;
                font-size: 8pt;
            }}
            
            .request-content {{
                font-size: 10pt;
                color: #1a1a1a;
                line-height: 1.6;
            }}
            
            .actions-section {{
                margin-left: 20px;
                margin-bottom: 15px;
            }}
            
            .actions-header {{
                font-weight: 600;
                color: #4b5563;
                font-size: 9pt;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }}
            
            .action {{
                background: white;
                border: 1px solid #e5e7eb;
                border-left: 3px solid #9ca3af;
                padding: 10px 12px;
                margin-bottom: 8px;
                font-size: 9pt;
            }}
            
            .action.success {{
                border-left-color: #10b981;
                background: #f0fdf4;
            }}
            
            .action.error {{
                border-left-color: #ef4444;
                background: #fef2f2;
            }}
            
            .action.info {{
                border-left-color: #f59e0b;
                background: #fffbeb;
            }}
            
            .action-name {{
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 4px;
            }}
            
            .action-details {{
                color: #6b7280;
                font-size: 8.5pt;
                margin: 4px 0;
                font-family: 'Courier New', monospace;
            }}
            
            .action-result {{
                color: #374151;
                font-size: 9pt;
                margin-top: 4px;
            }}
            
            .ai-response {{
                margin-left: 20px;
                background: #faf8ff;
                border-left: 3px solid #8b5cf6;
                padding: 12px;
                font-size: 9pt;
            }}
            
            .response-label {{
                font-weight: 600;
                color: #8b5cf6;
                font-size: 8.5pt;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }}
            
            .response-text {{
                color: #4b5563;
                line-height: 1.6;
            }}
            
            .summary-section {{
                background: #f0fdf4;
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
                page-break-inside: avoid;
            }}
            
            .summary-title {{
                color: #10b981;
                font-size: 14pt;
                font-weight: bold;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #d1fae5;
            }}
            
            .summary-item {{
                margin-bottom: 12px;
            }}
            
            .summary-label {{
                font-weight: 600;
                color: #059669;
                font-size: 9.5pt;
                margin-bottom: 4px;
            }}
            
            .summary-value {{
                color: #1f2937;
                font-size: 9.5pt;
                line-height: 1.6;
            }}
            
            .summary-list {{
                list-style: none;
                padding-left: 0;
                margin: 5px 0;
            }}
            
            .summary-list li {{
                padding: 4px 0;
                padding-left: 20px;
                position: relative;
            }}
            
            .summary-list li:before {{
                content: "✓";
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
            }}
            
            .footer {{
                margin-top: 40px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #9ca3af;
                font-size: 8pt;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Nutaan AI - Conversation Report</h1>
            <div class="subtitle">Generated on {current_date} at {current_time}</div>
        </div>
        
        <div class="section-title" style="color: #8b5cf6; font-size: 14pt; font-weight: bold; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e9d5ff;">💬 Full Conversation</div>
        {conversation_html}
        
        {summary_html}
        
        <div class="footer">
            <p>Nutaan AI by Tecosys • Powered by RudraX One</p>
        </div>
    </body>
    </html>
    """
    
    return html


def _generate_summary_section(total_actions, documents_created, doctypes, conversation_blocks):
    """Generate summary section HTML"""
    
    if total_actions == 0:
        return ""
    
    # Build documents summary
    docs_html = ""
    if documents_created:
        docs_html += '<ul class="summary-list">'
        for doc in documents_created:
            docs_html += f'<li>{doc["detail"]}</li>'
        docs_html += '</ul>'
    else:
        docs_html = '<div class="summary-value">No documents created</div>'
    
    # Build doctypes list
    doctypes_html = ", ".join(doctypes) if doctypes else "N/A"
    
    # Calculate overall outcome
    success_count = sum(1 for block in conversation_blocks 
                       for action in block.get('actions', []) 
                       if '✅' in str(action.get('result', '')))
    
    if success_count == total_actions:
        outcome = "✅ All actions completed successfully"
    elif success_count > 0:
        outcome = f"⚠️ {success_count}/{total_actions} actions completed successfully"
    else:
        outcome = "❌ Some actions encountered errors"
    
    html = f"""
    <div class="summary-section">
        <div class="summary-title">📊 Session Summary</div>
        
        <div class="summary-item">
            <div class="summary-label">Total Actions Performed:</div>
            <div class="summary-value">{total_actions} actions</div>
        </div>
        
        <div class="summary-item">
            <div class="summary-label">Documents Created:</div>
            {docs_html}
        </div>
        
        <div class="summary-item">
            <div class="summary-label">DocTypes Accessed:</div>
            <div class="summary-value">{doctypes_html}</div>
        </div>
        
        <div class="summary-item">
            <div class="summary-label">Overall Outcome:</div>
            <div class="summary-value">{outcome}</div>
        </div>
    </div>
    """
    
    return html


def _format_tool_name(tool_name: str) -> str:
    """Format tool name for display"""
    name_map = {
        'navigate': 'Navigate',
        'create_doc': 'Create Document',
        'set_field': 'Set Field',
        'set_table_field': 'Set Table Field',
        'click_button': 'Click Button',
        'analyze_screen': 'Analyze Screen'
    }
    return name_map.get(tool_name, tool_name.replace('_', ' ').title())


def _format_action_details(tool_name: str, args: Dict[str, Any]) -> str:
    """Format action arguments into readable details"""
    if not args:
        return ""
    
    # Custom formatting based on tool type
    if tool_name == 'navigate':
        doctype = args.get('doctype', '')
        name = args.get('name', '')
        return f"DocType: {doctype}" + (f", Name: {name}" if name else "")
    
    elif tool_name == 'create_doc':
        doctype = args.get('doctype', '')
        return f"DocType: {doctype}"
    
    elif tool_name == 'set_field':
        field = args.get('field', '')
        value = args.get('value', '')
        if isinstance(value, str) and len(value) > 40:
            value = value[:37] + "..."
        return f"Field: {field}, Value: {value}"
    
    elif tool_name == 'set_table_field':
        table = args.get('table', '')
        field = args.get('field', '')
        value = args.get('value', '')
        row = args.get('row', '')
        if isinstance(value, str) and len(value) > 30:
            value = value[:27] + "..."
        return f"Table: {table}, Row: {row}, Field: {field}, Value: {value}"
    
    elif tool_name == 'click_button':
        button = args.get('button_text', '')
        return f"Button: {button}"
    
    # Generic format for unknown tools
    details = []
    for key, value in list(args.items())[:3]:
        if isinstance(value, str) and len(value) > 30:
            value = value[:27] + "..."
        details.append(f"{key}: {value}")
    
    return ", ".join(details)


def _escape_html(text: str) -> str:
    """Escape HTML special characters"""
    if not isinstance(text, str):
        text = str(text)
    
    return (text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#39;")
            .replace("\n", "<br>"))


def generate_session_pdf(session_data: Dict[str, Any]) -> bytes:
    """
    Generate PDF from conversation/session data
    
    Args:
        session_data: Conversation data with messages array
        
    Returns:
        PDF bytes
    """
    # Generate HTML
    html = generate_conversation_report_html(session_data)
    
    # Convert to PDF using Frappe's utility
    pdf = get_pdf(html)
    
    return pdf
