/**
 * AI Agent Widget for ERPNext
 * Autonomous agent that can navigate, fill forms, and execute tasks
 * Powered by LangChain + Anthropic Claude Sonnet 4.5
 */

frappe.provide('ai_agent_widget');

class AgenticChatWidget {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messages = [];
        this.isLoading = false;
        this.currentToolCall = null;

        this.loadMessages();
        this.render();
        this.bindEvents();
    }

    loadMessages() {
        const saved = localStorage.getItem('frappe_ai_agent_messages');
        if (saved) {
            try {
                this.messages = JSON.parse(saved);
            } catch (e) {
                this.initializeChat();
            }
        } else {
            this.initializeChat();
        }
    }

    initializeChat() {
        this.messages = [{
            id: '1',
            role: 'assistant',
            content: `🤖 **Nutaan AI**\n\n"Simplicity is the ultimate sophistication."\n\nI'm ready to assist you correctly. How can I help?`,
            timestamp: new Date()
        }];
    }

    saveMessages() {
        if (this.messages.length > 1) {
            localStorage.setItem('frappe_ai_agent_messages', JSON.stringify(this.messages));
        }
    }

    render() {
        const html = `
            <div id="ai-agent-widget" class="ai-agent-widget" style="display: none;">
                <!-- Float Button -->
                <div class="ai-agent-float-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span class="ai-agent-tooltip">🤖 Nutaan AI</span>
                </div>
                
                <!-- Chat Window -->
                <div class="ai-agent-window" style="display: none;">
                    <div class="ai-agent-header">
                        <div class="ai-agent-header-left">
                            <div class="ai-agent-avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <div class="ai-agent-status"></div>
                            </div>
                            <div class="ai-agent-title">
                                <h3>Nutaan AI</h3>
                                <p class="ai-agent-subtitle">Always Ready</p>
                            </div>
                        </div>
                        <div class="ai-agent-header-actions">
                            <button class="ai-agent-minimize-btn" title="Minimize">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="4 14 10 14 10 20"></polyline>
                                    <polyline points="20 10 14 10 14 4"></polyline>
                                    <line x1="14" y1="10" x2="21" y2="3"></line>
                                    <line x1="3" y1="21" x2="10" y2="14"></line>
                                </svg>
                            </button>
                            <button class="ai-agent-close-btn" title="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="ai-agent-messages"></div>
                    
                    <div class="ai-agent-input-area">
                        <div class="ai-agent-quick-actions">
                            <button class="ai-agent-quick-btn" data-action="demo">⚡ Demo</button>
                            <button class="ai-agent-quick-btn" data-action="navigate">🎯 Navigate</button>
                            <button class="ai-agent-quick-btn" data-action="clear">🗑️ Clear</button>
                        </div>
                        <div class="ai-agent-input-wrapper">
                            <textarea class="ai-agent-input" placeholder="Tell me what to do..." rows="1"></textarea>
                            <button class="ai-agent-send-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(html);
        this.widget = $('#ai-agent-widget');
        this.floatBtn = this.widget.find('.ai-agent-float-button');
        this.window = this.widget.find('.ai-agent-window');
        this.messagesContainer = this.widget.find('.ai-agent-messages');
        this.input = this.widget.find('.ai-agent-input');

        this.widget.show();
        this.renderMessages();
    }

    bindEvents() {
        // Float button click
        this.floatBtn.on('click', () => this.toggleWindow());

        // Close button
        this.widget.find('.ai-agent-close-btn').on('click', () => this.toggleWindow());

        // Minimize button
        this.widget.find('.ai-agent-minimize-btn').on('click', () => this.toggleMinimize());

        // Send button
        this.widget.find('.ai-agent-send-btn').on('click', () => this.sendMessage());

        // Enter to send
        this.input.on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick actions
        this.widget.find('.ai-agent-quick-btn').on('click', (e) => {
            const action = $(e.currentTarget).data('action');
            this.handleQuickAction(action);
        });
    }

    toggleWindow() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.floatBtn.hide();
            this.window.show();
        } else {
            this.window.hide();
            this.floatBtn.show();
        }
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.window.toggleClass('minimized');
    }

    handleQuickAction(action) {
        switch (action) {
            case 'demo':
                this.input.val('Go to Sales Order and create a new sales order with customer ABC Corp');
                break;
            case 'navigate':
                this.input.val('Go to ');
                this.input.focus();
                break;
            case 'clear':
                this.clearChat();
                break;
        }
    }

    clearChat() {
        this.initializeChat();
        localStorage.removeItem('frappe_ai_agent_messages');
        this.renderMessages();
    }

    renderMessages() {
        this.messagesContainer.empty();

        this.messages.forEach(msg => {
            const msgHtml = this.createMessageElement(msg);
            this.messagesContainer.append(msgHtml);
        });

        this.scrollToBottom();
    }

    createMessageElement(message) {
        const isUser = message.role === 'user';
        const toolCallsHtml = message.toolCalls ? this.renderToolCalls(message.toolCalls) : '';

        // Tool calls FIRST, then final answer
        return `
            <div class="ai-agent-message ${isUser ? 'user' : 'assistant'}">
                <div class="ai-agent-message-content">
                    ${toolCallsHtml}
                    <div class="ai-agent-message-text">${this.formatContent(message.content)}</div>
                </div>
            </div>
        `;
    }

    renderToolCalls(toolCalls) {
        return toolCalls.map(tc => `
            <div class="ai-agent-tool-call ${tc.executing ? 'executing' : 'completed'}">
                <div class="ai-agent-tool-name">⚡ ${tc.name}</div>
                ${tc.result ? `<div class="ai-agent-tool-result">${tc.result}</div>` : ''}
            </div>
        `).join('');
    }

    formatContent(content) {
        if (!content) return '';

        // Convert markdown-style formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop(this.messagesContainer[0].scrollHeight);
    }

    async sendMessage() {
        const text = this.input.val().trim();
        if (!text || this.isLoading) return;

        // Add user message
        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        this.messages.push(userMsg);
        this.input.val('');
        this.renderMessages();

        // Add assistant message placeholder
        const assistantMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            toolCalls: [],
            isStreaming: true,
            timestamp: new Date()
        };
        this.messages.push(assistantMsg);
        this.renderMessages();

        this.isLoading = true;
        this.updateSubtitle('Processing...');

        try {
            await this.streamResponse(text, assistantMsg);
        } catch (error) {
            console.error('Error:', error);
            assistantMsg.content = `❌ Error: ${error.message}`;
            this.renderMessages();
        } finally {
            this.isLoading = false;
            this.currentToolCall = null;
            this.updateSubtitle('Ready');
            this.saveMessages();
        }
    }

    async streamResponse(message, assistantMsg) {
        try {
            // Single API call - backend handles entire agent loop with streaming events
            this.updateSubtitle('🤔 Thinking...');

            const response = await fetch('/api/method/ai_agent_widget.api.agent_stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': frappe.csrf_token
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        currentPath: frappe.get_route_str(),
                        user: frappe.session.user
                    },
                    history: this.messages.filter(m => m.id !== assistantMsg.id).map(m => ({
                        role: m.role,
                        content: m.content || ''
                    }))
                })
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const data = await response.json();
            const result = data.message || data;

            if (result.error) {
                throw new Error(result.error);
            }

            // Debug: log full result
            console.log('Agent result:', result);
            console.log('Tool calls:', result.tool_calls);
            console.log('Agent steps:', result.agent_steps);
            console.log('Debug events:', result.debug_events);

            // Process agent_steps for step-by-step display
            assistantMsg.toolCalls = assistantMsg.toolCalls || [];
            assistantMsg.agentSteps = result.agent_steps || [];

            // Collect tool execution results to send back to agent
            const toolExecutionResults = [];
            let hasErrors = false;

            // Process each step from the agent
            for (const step of assistantMsg.agentSteps) {
                if (step.type === 'tool_call') {
                    this.updateSubtitle(`🔧 ${step.tool}...`);

                    const toolCallUI = {
                        name: step.tool,
                        args: step.args,
                        executing: true
                    };
                    assistantMsg.toolCalls.push(toolCallUI);
                    this.renderMessages();

                    // Execute tool on frontend
                    const toolOutput = await this.executeToolCall(step.tool, step.args);
                    toolCallUI.result = toolOutput;
                    toolCallUI.executing = false;
                    this.renderMessages();

                    // Collect result for feedback
                    toolExecutionResults.push({
                        tool: step.tool,
                        result: toolOutput
                    });

                    if (toolOutput.includes('❌') || toolOutput.includes('⚠️')) {
                        hasErrors = true;
                    }

                    await this.wait(400);

                } else if (step.type === 'tool_result') {
                    this.updateSubtitle(`✅ Tool completed`);
                    await this.wait(200);

                } else if (step.type === 'response') {
                    if (step.content && !step.content.includes('tool_calls')) {
                        // Don't show response yet - we need to check if errors occurred
                        if (!hasErrors) {
                            assistantMsg.content = step.content;
                            this.renderMessages();
                        }
                    }
                }
            }

            // If errors occurred, tell the agent about them
            if (hasErrors && toolExecutionResults.length > 0) {
                this.updateSubtitle('🔄 Updating agent...');

                // Build summary of what happened
                const errorSummary = toolExecutionResults
                    .filter(r => r.result.includes('❌') || r.result.includes('⚠️'))
                    .map(r => `${r.tool}: ${r.result}`)
                    .join('\n');

                // Show errors as the response
                assistantMsg.content = `Some actions had issues:\n\n${errorSummary}\n\nPlease provide valid data (e.g., existing Customer and Item names).`;
            } else if (result.content) {
                // No errors, show agent's response
                assistantMsg.content = result.content;
            } else if (assistantMsg.toolCalls.length > 0) {
                assistantMsg.content = '✅ Done';
            }

            assistantMsg.isStreaming = false;
            this.renderMessages();
            this.updateSubtitle('Ready');
            this.saveMessages();

        } catch (error) {
            console.error('Agent Error:', error);
            assistantMsg.content = `❌ Error: ${error.message}`;
            assistantMsg.isStreaming = false;
            this.renderMessages();
            this.updateSubtitle('Error');
        }
    }

    async executeToolCallFromData(actionData) {
        try {
            const action = actionData.action;

            switch (action) {
                case 'navigate':
                    if (actionData.name) {
                        frappe.set_route('Form', actionData.doctype, actionData.name);
                    } else {
                        frappe.set_route('List', actionData.doctype);
                    }
                    await this.wait(500);
                    return `✅ Navigated to ${actionData.doctype}`;

                case 'create_doc':
                    frappe.new_doc(actionData.doctype);
                    await this.wait(500);
                    return `✅ Creating new ${actionData.doctype}`;

                case 'set_field':
                    if (cur_frm) {
                        await cur_frm.set_value(actionData.fieldname, actionData.value);
                        return `✅ Set ${actionData.fieldname} to "${actionData.value}"`;
                    }
                    return `❌ No form is currently open`;

                case 'click_button':
                    const button = this.findButton(actionData.button_text);
                    if (button) {
                        button.click();
                        return `✅ Clicked "${actionData.button_text}"`;
                    }
                    return `❌ Button "${actionData.button_text}" not found`;

                case 'analyze_screen':
                    return this.analyzeScreen(actionData.purpose);

                default:
                    return `❌ Unknown action: ${action}`;
            }
        } catch (error) {
            return `❌ Error: ${error.message}`;
        }
    }

    async executeToolCall(toolName, args) {
        try {
            switch (toolName) {
                case 'navigate':
                    if (args.name) {
                        frappe.set_route('Form', args.doctype, args.name);
                    } else {
                        frappe.set_route('List', args.doctype);
                    }
                    await this.wait(500);
                    return `✅ Navigated to ${args.doctype}`;

                case 'create_doc':
                    frappe.new_doc(args.doctype);
                    await this.wait(500);
                    return `✅ Creating new ${args.doctype}`;

                case 'set_field':
                    if (cur_frm) {
                        try {
                            // Close any existing dialogs first
                            $('.modal.show .btn-modal-close').click();
                            await this.wait(100);

                            await cur_frm.set_value(args.fieldname, args.value);
                            await this.wait(700); // Wait for async Link field validation

                            // Check for Frappe error dialogs
                            const errorDialog = document.querySelector('.modal.show .modal-body');
                            if (errorDialog) {
                                const errorText = errorDialog.innerText.trim();
                                if (errorText.includes('not exist') || errorText.includes('not found') || errorText.includes('Invalid')) {
                                    $('.modal.show .btn-modal-close, .modal.show .btn-primary').click();
                                    return `❌ ${args.fieldname}: ${errorText}`;
                                }
                            }

                            // Verify value was actually set
                            const actualValue = cur_frm.doc[args.fieldname];
                            if (!actualValue && args.value) {
                                return `⚠️ ${args.fieldname} could not be set to "${args.value}" - may not exist`;
                            }
                            return `✅ Set ${args.fieldname} to "${args.value}"`;
                        } catch (e) {
                            return `❌ Failed to set ${args.fieldname}: ${e.message || e || 'Unknown error'}`;
                        }
                    }
                    return `❌ No form is currently open`;

                case 'click_button':
                    const button = this.findButton(args.button_text);
                    if (button) {
                        // Clear any existing error messages
                        const existingErrors = this.captureValidationErrors();
                        button.click();
                        await this.wait(1000); // Wait for validation

                        // Check for new validation errors
                        const newErrors = this.captureValidationErrors();
                        if (newErrors) {
                            return `⚠️ Clicked "${args.button_text}" but got validation errors:\n${newErrors}`;
                        }
                        return `✅ Clicked "${args.button_text}"`;
                    }
                    return `❌ Button "${args.button_text}" not found`;

                case 'analyze_screen':
                    return this.analyzeScreen(args.purpose);

                case 'get_validation_errors':
                    const errors = this.captureValidationErrors();
                    return errors || '✅ No validation errors';

                case 'scroll_page':
                    const scrollAmount = args.amount || 300;
                    if (args.direction === 'up') {
                        window.scrollBy(0, -scrollAmount);
                    } else {
                        window.scrollBy(0, scrollAmount);
                    }
                    await this.wait(200);
                    return `✅ Scrolled ${args.direction} by ${scrollAmount}px`;

                case 'type_text':
                    if (args.fieldname && cur_frm) {
                        const field = cur_frm.fields_dict[args.fieldname];
                        if (field && field.$input) {
                            field.$input.focus();
                            await this.wait(100);
                        }
                    }
                    // Simulate typing by setting value
                    if (cur_frm && args.fieldname) {
                        await cur_frm.set_value(args.fieldname, args.text);
                        return `✅ Typed "${args.text}" in ${args.fieldname}`;
                    }
                    return `❌ Could not type - no form or field`;

                case 'select_option':
                    if (cur_frm) {
                        await cur_frm.set_value(args.fieldname, args.value);
                        cur_frm.refresh_field(args.fieldname);
                        return `✅ Selected "${args.value}" for ${args.fieldname}`;
                    }
                    return `❌ No form is currently open`;

                case 'get_field_value':
                    if (cur_frm) {
                        const value = cur_frm.doc[args.fieldname];
                        return `📋 ${args.fieldname} = "${value || '(empty)'}"`;
                    }
                    return `❌ No form is currently open`;

                case 'wait_for_element':
                    const timeout = args.timeout || 5000;
                    const found = await this.waitForElement(args.selector, timeout);
                    return found ? `✅ Element found: ${args.selector}` : `❌ Timeout waiting for ${args.selector}`;

                case 'add_table_row':
                    if (cur_frm) {
                        const row = cur_frm.add_child(args.table_fieldname);
                        cur_frm.refresh_field(args.table_fieldname);
                        const rowCount = cur_frm.doc[args.table_fieldname].length;
                        return `✅ Added row ${rowCount} to ${args.table_fieldname}`;
                    }
                    return `❌ No form is currently open`;

                case 'set_table_field':
                    if (cur_frm) {
                        const table = cur_frm.doc[args.table_fieldname];
                        if (table && table.length >= args.row_idx) {
                            const rowDoc = table[args.row_idx - 1]; // Convert 1-based to 0-based
                            await frappe.model.set_value(rowDoc.doctype, rowDoc.name, args.fieldname, args.value);

                            // Wait for ERPNext to auto-populate related fields (especially for item_code)
                            if (args.fieldname === 'item_code') {
                                await this.wait(1000); // Give ERPNext time to fetch item details
                            }

                            cur_frm.refresh_field(args.table_fieldname);
                            return `✅ Set ${args.fieldname} to "${args.value}" in row ${args.row_idx}`;
                        }
                        return `❌ Row ${args.row_idx} not found in ${args.table_fieldname}`;
                    }
                    return `❌ No form is currently open`;

                case 'search_doctype':
                    try {
                        const searchResults = await new Promise((resolve, reject) => {
                            frappe.call({
                                method: 'frappe.client.get_list',
                                args: {
                                    doctype: args.doctype,
                                    filters: args.search_text ? [[args.doctype, 'name', 'like', `%${args.search_text}%`]] : [],
                                    fields: ['name'],
                                    limit_page_length: args.limit || 20
                                },
                                callback: (r) => {
                                    if (r.message) {
                                        resolve(r.message);
                                    } else {
                                        resolve([]);
                                    }
                                },
                                error: (err) => reject(err)
                            });
                        });

                        if (searchResults.length === 0) {
                            return `📋 No ${args.doctype} records found matching "${args.search_text}"`;
                        }

                        const names = searchResults.map(r => r.name).slice(0, 10);
                        const displayList = names.join(', ');
                        const total = searchResults.length;
                        return `📋 Found ${total} ${args.doctype} record(s) matching "${args.search_text}":\n${displayList}${total > 10 ? ` (showing first 10)` : ''}`;
                    } catch (error) {
                        return `❌ Error searching ${args.doctype}: ${error.message || error}`;
                    }

                case 'get_doctype_list':
                    try {
                        const listResults = await new Promise((resolve, reject) => {
                            frappe.call({
                                method: 'frappe.client.get_list',
                                args: {
                                    doctype: args.doctype,
                                    fields: ['name'],
                                    limit_page_length: args.limit || 50
                                },
                                callback: (r) => {
                                    if (r.message) {
                                        resolve(r.message);
                                    } else {
                                        resolve([]);
                                    }
                                },
                                error: (err) => reject(err)
                            });
                        });

                        if (listResults.length === 0) {
                            return `📋 No ${args.doctype} records found in the system`;
                        }

                        const names = listResults.map(r => r.name).slice(0, 15);
                        const displayList = names.join(', ');
                        const total = listResults.length;
                        return `📋 Available ${args.doctype} records (${total} total):\n${displayList}${total > 15 ? ` (showing first 15)` : ''}`;
                    } catch (error) {
                        return `❌ Error listing ${args.doctype}: ${error.message || error}`;
                    }

                case 'validate_doctype_exists':
                    try {
                        const exists = await new Promise((resolve, reject) => {
                            frappe.call({
                                method: 'frappe.client.get_value',
                                args: {
                                    doctype: args.doctype,
                                    filters: { name: args.name },
                                    fieldname: 'name'
                                },
                                callback: (r) => {
                                    resolve(r.message && r.message.name);
                                },
                                error: (err) => reject(err)
                            });
                        });

                        if (exists) {
                            return `✅ ${args.doctype} "${args.name}" exists`;
                        } else {
                            return `❌ ${args.doctype} "${args.name}" does NOT exist`;
                        }
                    } catch (error) {
                        return `❌ Error validating ${args.doctype}: ${error.message || error}`;
                    }

                default:
                    return `❌ Unknown tool: ${toolName}`;
            }
        } catch (error) {
            return `❌ Error: ${error.message}`;
        }
    }

    async waitForElement(selector, timeout) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            // Try CSS selector first
            let el = document.querySelector(selector);
            // Try frappe field
            if (!el && cur_frm && cur_frm.fields_dict[selector]) {
                el = cur_frm.fields_dict[selector].$wrapper[0];
            }
            if (el) return true;
            await this.wait(100);
        }
        return false;
    }

    findButton(text) {
        // Exclude buttons inside the AI Agent widget
        const buttons = $('button').not('.ai-agent-widget button').filter(function () {
            return $(this).text().trim().toLowerCase().includes(text.toLowerCase());
        });
        return buttons.length > 0 ? buttons[0] : null;
    }

    analyzeScreen(purpose) {
        const route = frappe.get_route_str();
        const title = document.title;

        // Exclude AI Agent widget from analysis
        const buttons = $('button').not('.ai-agent-widget button').map(function () {
            return $(this).text().trim();
        }).get().filter(Boolean).slice(0, 15); // Limit to 15 buttons

        const headings = $('h1, h2, h3').not('.ai-agent-widget h1, .ai-agent-widget h2, .ai-agent-widget h3').map(function () {
            return $(this).text().trim();
        }).get().filter(Boolean).slice(0, 10);

        // Get form fields if available
        let formFields = '';
        if (cur_frm) {
            const fieldNames = Object.keys(cur_frm.fields_dict).slice(0, 20);
            const fieldInfo = fieldNames.map(fn => {
                const f = cur_frm.fields_dict[fn];
                const val = cur_frm.doc[fn];
                return `${fn}${val ? '=' + val : ''}`;
            }).join(', ');
            formFields = `\nFields: ${fieldInfo}`;

            // Child table info
            const tables = cur_frm.meta.fields.filter(f => f.fieldtype === 'Table');
            if (tables.length) {
                const tableInfo = tables.map(t => {
                    const rows = cur_frm.doc[t.fieldname] || [];
                    return `${t.fieldname}(${rows.length} rows)`;
                }).join(', ');
                formFields += `\nTables: ${tableInfo}`;
            }
        }

        return `📊 Screen Analysis (${purpose}):
Page: ${title}
Route: ${route}
Buttons: ${buttons.join(', ') || 'None'}
Headings: ${headings.join(', ') || 'None'}
Form: ${cur_frm ? `${cur_frm.doctype} - ${cur_frm.docname || 'New'}` : 'None'}${formFields}`;
    }

    captureValidationErrors() {
        // Capture Frappe error dialogs, msgprint, and validation messages
        const errors = [];

        // Check for modal dialogs with errors
        const modalBody = document.querySelector('.modal.show .modal-body, .msgprint-dialog .msgprint');
        if (modalBody) {
            const modalText = modalBody.innerText.trim();
            if (modalText) {
                errors.push(modalText);
            }
        }

        // Check for validation errors in the form
        if (cur_frm) {
            // Check for missing mandatory fields
            const invalidFields = cur_frm.layout.fields.filter(f => {
                if (f.df && f.df.reqd && !cur_frm.doc[f.df.fieldname]) {
                    return true;
                }
                return false;
            });

            if (invalidFields.length > 0) {
                const fieldNames = invalidFields.map(f => f.df.label || f.df.fieldname).join(', ');
                errors.push(`Missing mandatory fields: ${fieldNames}`);
            }

            // Check child tables for missing mandatory fields
            if (cur_frm.meta && cur_frm.meta.fields) {
                cur_frm.meta.fields.filter(f => f.fieldtype === 'Table').forEach(tableField => {
                    const tableData = cur_frm.doc[tableField.fieldname] || [];
                    tableData.forEach((row, idx) => {
                        // Check each row for missing required fields
                        const rowMeta = frappe.get_meta(tableField.options);
                        if (rowMeta) {
                            const missingInRow = rowMeta.fields
                                .filter(rf => rf.reqd && !row[rf.fieldname])
                                .map(rf => rf.label || rf.fieldname);
                            if (missingInRow.length > 0) {
                                errors.push(`Row ${idx + 1} in ${tableField.label}: Missing ${missingInRow.join(', ')}`);
                            }
                        }
                    });
                });
            }
        }

        // Check for Frappe.throw messages
        const errorAlert = document.querySelector('.frappe-control.has-error .help-block');
        if (errorAlert) {
            errors.push(errorAlert.innerText.trim());
        }

        return errors.length > 0 ? errors.join('\n') : null;
    }

    updateSubtitle(text) {
        this.widget.find('.ai-agent-subtitle').text(text);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when Frappe is ready
$(document).ready(() => {
    if (frappe.session.user !== 'Guest') {
        setTimeout(() => {
            window.aiAgentWidget = new AgenticChatWidget();
        }, 1000);
    }
});
