/**
 * Nutaan AI Widget for ERPNext
 * Intelligent automation assistant that can navigate, create records, and fill forms
 * Professional AI-powered workspace automation
 */

frappe.provide('ai_agent_widget');

class AgenticChatWidget {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messages = [];
        this.isLoading = false;
        this.currentToolCall = null;
        this.currentSessionData = null;  // Store session data for export
        this.hasCompletedActions = false; // Track if any actions were performed
        this.currentPdfKey = null; // Store PDF cache key for cleanup

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
            content: `**Nutaan AI**\n Intelligent Automation at Your Fingertips \n\nI can help you with:\n\n🎯 **Navigate** - Go to any page or document\n📝 **Create** - Create new records instantly\n✏️ **Fill Forms** - Automate data entry\n🔍 **Analyze** - Understand page content\n\nWhat would you like to automate today?`,
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
                    <span class="ai-agent-tooltip">RudraX One- powered by Nutaan AI ✨</span>
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
                                <h3>RudraX One- powered by Nutaan AI</h3>
                                <p class="ai-agent-subtitle">Ready to assist</p>
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
                            <button class="ai-agent-quick-btn" data-action="demo" title="Try Demo">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span>Demo</span>
                            </button>
                            <button class="ai-agent-quick-btn" data-action="navigate" title="Navigate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>Navigate</span>
                            </button>
                            <button class="ai-agent-quick-btn ai-agent-export-btn" data-action="export" title="Export Report" style="display: none;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                <span>Export</span>
                            </button>
                            <button class="ai-agent-quick-btn" data-action="clear" title="Clear Chat">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                <span>Clear</span>
                            </button>
                        </div>
                        <div class="ai-agent-input-wrapper">
                            <textarea class="ai-agent-input" placeholder="How can I help you today?" rows="1"></textarea>
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

        // Floating export button
        this.widget.find('.ai-agent-export-floating-btn').on('click', () => this.showExportModal());

        // Send button
        this.widget.find('.ai-agent-send-btn').on('click', () => this.sendMessage());

        // Enter to send
        this.input.on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea on all input changes
        this.input.on('input keyup change paste', () => {
            this.autoResizeTextarea();
        });

        // Also resize on focus to handle any missed changes
        this.input.on('focus', () => {
            this.autoResizeTextarea();
        });

        // Quick actions
        this.widget.find('.ai-agent-quick-btn').on('click', (e) => {
            const action = $(e.currentTarget).data('action');
            if (action === 'export') {
                this.showExportModal();
            } else {
                this.handleQuickAction(action);
            }
        });
    }

    autoResizeTextarea() {
        // Store current scroll position to prevent jumping
        const currentScrollTop = this.input[0].scrollTop;

        // Reset height to minimum to get accurate scrollHeight
        this.input.css('height', '44px');

        const scrollHeight = this.input[0].scrollHeight;
        const maxHeight = 120;
        const minHeight = 44;

        // Calculate new height with proper constraints
        let newHeight;
        if (scrollHeight > maxHeight) {
            newHeight = maxHeight;
            this.input.css('overflow-y', 'auto');
        } else {
            newHeight = Math.max(scrollHeight, minHeight);
            this.input.css('overflow-y', 'hidden');
        }

        // Apply new height smoothly
        this.input.css('height', newHeight + 'px');

        // Restore scroll position if needed
        if (currentScrollTop > 0) {
            this.input[0].scrollTop = currentScrollTop;
        }
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
                this.input.val('Go to Sales Order and create a new sales order with customer Aditya Birla Group');
                this.autoResizeTextarea(); // Trigger resize after setting value
                this.input.focus();
                break;
            case 'navigate':
                this.input.val('Go to ');
                this.autoResizeTextarea(); // Trigger resize after setting value
                this.input.focus();
                break;
            case 'clear':
                this.clearChat();
                break;
        }
    }

    clearChat() {
        // Clear PDF cache if it exists
        if (this.currentPdfKey) {
            fetch('/api/method/frappe.cache_manager.clear_value', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': frappe.csrf_token
                },
                body: JSON.stringify({
                    key: `pdf_${this.currentPdfKey}`
                })
            }).catch(err => { }); // Silent fail on cache cleanup

            this.currentPdfKey = null;
        }

        // Clear validation cache and flow state (if they exist)
        if (this.validatedEntities) {
            Object.keys(this.validatedEntities).forEach(key => {
                if (this.validatedEntities[key] && typeof this.validatedEntities[key].clear === 'function') {
                    this.validatedEntities[key].clear();
                }
            });
        }

        if (this.flowState) {
            this.flowState = {
                currentGoal: null,
                dependencies: [],
                createdEntities: [],
                pendingInfo: {}
            };
        }

        this.initializeChat();
        this.currentSessionData = null;
        this.hasCompletedActions = false;
        this.widget.find('.ai-agent-export-btn').fadeOut(300);
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

        // Ensure content is a string
        const textContent = typeof content === 'string' ? content : String(content);

        // Convert markdown-style formatting
        return textContent
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop(this.messagesContainer[0].scrollHeight);
    }

    cleanResponseContent(content) {
        // Helper to extract clean text from complex LangChain/AI responses
        if (!content) return '';

        // If it's a string, check if it looks like JSON
        if (typeof content === 'string') {
            // Try to parse as JSON array (format: [{"type":"text","text":"..."}])
            if (content.trim().startsWith('[{')) {
                try {
                    const parsed = JSON.parse(content);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Extract text from first object
                        const firstItem = parsed[0];
                        if (firstItem.type === 'text' && firstItem.text) {
                            return firstItem.text;
                        }
                    }
                } catch (e) {
                    // Not valid JSON, return as-is
                    return content;
                }
            }
            return content;
        }

        // If it's an array (already parsed)
        if (Array.isArray(content) && content.length > 0) {
            const firstItem = content[0];
            if (firstItem.type === 'text' && firstItem.text) {
                return firstItem.text;
            }
            if (typeof firstItem === 'string') {
                return firstItem;
            }
        }

        // If it's an object
        if (typeof content === 'object') {
            // Try common text fields
            return content.text || content.message || content.content || JSON.stringify(content);
        }

        return String(content);
    }

    shouldShowToolCall(toolName) {
        // Hide technical/internal tools from UI to keep it clean and user-friendly
        const hiddenTools = [
            'get_doctype_list',        // Internal data fetching
            'validate_doctype_exists',  // Backend validation
            'search_doctype',          // Search operations
            'get_validation_errors',   // Error checking
            'add_table_row'            // Low-level table manipulation
        ];

        return !hiddenTools.includes(toolName);
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

            // Production: Only log errors, not debug info

            // Process agent_steps for step-by-step display
            assistantMsg.toolCalls = assistantMsg.toolCalls || [];
            assistantMsg.agentSteps = result.agent_steps || [];

            // Collect tool execution results to send back to agent
            const toolExecutionResults = [];
            let hasErrors = false;

            // Process each step from the agent
            for (const step of assistantMsg.agentSteps) {
                if (step.type === 'tool_call') {
                    // Skip technical tools from UI display
                    if (!this.shouldShowToolCall(step.tool)) {
                        // Execute silently without showing in UI
                        const toolOutput = await this.executeToolCall(step.tool, step.args);
                        toolExecutionResults.push({
                            tool: step.tool,
                            result: toolOutput
                        });
                        if (toolOutput.includes('❌') || toolOutput.includes('⚠️')) {
                            hasErrors = true;
                        }
                        continue; // Skip UI rendering
                    }

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


            // Check if we have a final response from the agent
            if (result.content) {
                const cleanContent = this.cleanResponseContent(result.content);
                assistantMsg.content = cleanContent;
            } else if (hasErrors && toolExecutionResults.length > 0) {
                // Only show raw errors if agent didn't provide a response
                const errorSummary = toolExecutionResults
                    .filter(r => r.result.includes('❌') || r.result.includes('⚠️'))
                    .map(r => `${r.tool}: ${r.result}`)
                    .join('\n');

                assistantMsg.content = `⚠️ Some actions encountered issues:\n\n${errorSummary}\n\nPlease review the errors above or try a different approach.`;
            } else if (assistantMsg.toolCalls.length > 0) {
                assistantMsg.content = '✅ Task completed successfully';
            } else {
                assistantMsg.content = '✅ Done';
            }


            // Store session data if available and show export button
            if (result.session_data && result.session_data.total_actions > 0) {
                this.currentSessionData = result.session_data;
            }

            // Show export button if we have conversation history
            if (this.messages.length > 2 && assistantMsg.toolCalls && assistantMsg.toolCalls.length > 0) {
                this.hasCompletedActions = true;
                this.widget.find('.ai-agent-export-btn').fadeIn(300);
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
                    // Use set_route to ensure form opens in full screen (not dialog)
                    frappe.set_route('Form', actionData.doctype, 'new');
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
                    // Use set_route to ensure form opens in full screen (not dialog)
                    frappe.set_route('Form', args.doctype, 'new');
                    // Wait for proper form load
                    let formReady = false;
                    for (let i = 0; i < 20; i++) {
                        if (cur_frm && cur_frm.docname && !cur_frm.docname.includes('New ' + args.doctype + ' 1')) {
                            formReady = true;
                            break;
                        }
                        // Note: Frappe temporary names can vary, but generally we just need cur_frm to exist and match doctype
                        if (cur_frm && cur_frm.doctype === args.doctype) {
                            formReady = true;
                            break;
                        }
                        await this.wait(200);
                    }

                    if (!formReady || !cur_frm) {
                        return `⚠️ Form for ${args.doctype} opened but not fully loaded. Please wait...`;
                    }

                    // Extra wait to ensure all field bindings are complete
                    await this.wait(1000);
                    return `✅ ${args.doctype} form ready`;

                case 'set_field':
                    // Retry logic for form loading
                    for (let retry = 0; retry < 3; retry++) {
                        if (cur_frm && cur_frm.fields_dict && Object.keys(cur_frm.fields_dict).length > 0) break;
                        await this.wait(400); // Wait for form to load
                    }

                    if (cur_frm) {
                        try {
                            // Close any existing dialogs first
                            $('.modal.show .btn-modal-close').click();
                            await this.wait(100);

                            // Verify field exists
                            if (!cur_frm.fields_dict[args.fieldname] && !cur_frm.doc.hasOwnProperty(args.fieldname)) {
                                return `❌ Field "${args.fieldname}" NOT found in form. Check fieldname.`;
                            }

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
                                return `⚠️ ${args.fieldname} could not be set. It might be read-only or invalid.`;
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
                        if (!$(button).is(':visible')) {
                            return `❌ Button "${args.button_text}" found but it is hidden/invisible. Cannot click.`;
                        }

                        // Clear any existing error messages
                        const existingErrors = this.captureValidationErrors();
                        button.click();
                        await this.wait(1000); // Wait for validation

                        // Check for new validation errors
                        const newErrors = this.captureValidationErrors();

                        // Intercept and close any error dialogs
                        const errorDialog = document.querySelector('.modal.show .modal-body');
                        if (errorDialog) {
                            const errorText = errorDialog.innerText.trim();
                            if (errorText && errorText.length > 0) {
                                // Close the dialog before showing error to agent
                                $('.modal.show .btn-modal-close, .modal.show .btn-primary, .modal.show .btn-default').click();
                                await this.wait(200);
                                return `❌ Validation error: ${errorText}`;
                            }
                        }

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
                    const scrollAmount = args.amount || 500; // Increased default amount
                    const directionMult = args.direction === 'up' ? -1 : 1;
                    const offset = scrollAmount * directionMult;

                    // Helper to check if element is scrollable
                    const isScrollable = (el) => {
                        if (!el) return false;
                        // Window/Body case
                        if (el === window || el === document.scrollingElement || el === document.documentElement || el === document.body) {
                            return document.body.scrollHeight > window.innerHeight;
                        }
                        // Element case
                        const style = window.getComputedStyle(el);
                        const overflowY = style.overflowY;
                        const isScrollableStyle = overflowY === 'auto' || overflowY === 'scroll';
                        return isScrollableStyle && el.scrollHeight > el.clientHeight;
                    };

                    // Priority list of potential scroll containers in Frappe
                    // Use Array.from to convert NodeList to Array and filter for visibility
                    const scrollCandidates = [
                        ...Array.from(document.querySelectorAll('.layout-main-section')).filter(el => el.offsetParent !== null), // Visible workspaces
                        ...Array.from(document.querySelectorAll('.main-section')).filter(el => el.offsetParent !== null),        // Visible forms
                        ...Array.from(document.querySelectorAll('.page-container')).filter(el => el.offsetParent !== null),
                        ...Array.from(document.querySelectorAll('.frappe-list .result-list')).filter(el => el.offsetParent !== null),
                        document.scrollingElement,
                        window
                    ];

                    let scrolledElement = null;
                    let initialScroll = 0;

                    // Find the first valid scrollable container
                    for (const el of scrollCandidates) {
                        if (el && isScrollable(el)) {
                            // Get current scroll position
                            initialScroll = (el === window) ? window.scrollY : el.scrollTop;

                            // Check if we can actually scroll in the requested direction
                            const maxScroll = (el === window) ?
                                (document.body.scrollHeight - window.innerHeight) :
                                (el.scrollHeight - el.clientHeight);

                            if (args.direction === 'down' && initialScroll >= maxScroll - 5) continue; // Already at bottom
                            if (args.direction === 'up' && initialScroll <= 0) continue; // Already at top

                            // Perform scroll
                            const behavior = 'smooth';
                            if (el === window) {
                                window.scrollBy({ top: offset, behavior });
                            } else {
                                el.scrollBy({ top: offset, behavior });
                            }

                            scrolledElement = el;
                            break; // Stop after scrolling the best candidate
                        }
                    }

                    if (!scrolledElement) {
                        return `⚠️ Could not scroll. The page might not be scrollable or is already at the ${args.direction === 'up' ? 'top' : 'bottom'}.`;
                    }

                    await this.wait(600); // Wait for smooth scroll

                    // Verify scroll happened
                    const finalScroll = (scrolledElement === window) ? window.scrollY : scrolledElement.scrollTop;
                    const diff = Math.abs(finalScroll - initialScroll);

                    if (diff < 10) {
                        return `⚠️ Checked scroll, but position didn't change. You might be at the end of the page.`;
                    }

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
                        const table = cur_frm.doc[args.table_fieldname] || [];

                        // Check if there's already an empty row
                        const hasEmptyRow = table.some(row => {
                            // For items table, check if item_code is empty
                            if (args.table_fieldname === 'items') {
                                return !row.item_code || row.item_code === '';
                            }
                            // For other tables, check if first required field is empty
                            return Object.keys(row).filter(k => !k.startsWith('_')).length <= 3;
                        });

                        if (hasEmptyRow && table.length > 0) {
                            // Don't add a new row, use the existing empty one
                            return `✅ Using existing empty row in ${args.table_fieldname}`;
                        }

                        // Add new row only if no empty rows exist
                        const row = cur_frm.add_child(args.table_fieldname);
                        cur_frm.refresh_field(args.table_fieldname);
                        const rowCount = cur_frm.doc[args.table_fieldname].length;
                        return `✅ Added row ${rowCount} to ${args.table_fieldname}`;
                    }
                    return `❌ No form is currently open`;

                case 'set_table_field':
                    if (cur_frm) {
                        try {
                            const table = cur_frm.doc[args.table_fieldname];
                            if (!table || table.length === 0) {
                                return `❌ Table "${args.table_fieldname}" is empty`;
                            }

                            if (table.length < args.row_idx) {
                                return `❌ Row ${args.row_idx} not found in ${args.table_fieldname} (only ${table.length} rows exist)`;
                            }

                            const rowDoc = table[args.row_idx - 1];
                            if (!rowDoc) {
                                return `❌ Could not access row ${args.row_idx}`;
                            }

                            await frappe.model.set_value(rowDoc.doctype, rowDoc.name, args.fieldname, args.value);

                            // Wait for ERPNext to auto-populate
                            if (args.fieldname === 'item_code') {
                                await this.wait(1500);
                            } else {
                                await this.wait(300);
                            }

                            cur_frm.refresh_field(args.table_fieldname);
                            return `✅ Set ${args.fieldname} to "${args.value}" in row ${args.row_idx}`;
                        } catch (error) {
                            console.error('set_table_field error:', error);
                            // Properly stringify error object
                            const errorMsg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
                            return `❌ Error setting ${args.fieldname}: ${errorMsg}`;
                        }
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
                        const total = listResults.length;

                        // Return in clear format with exact names in quotes
                        const quotedNames = names.map(n => `"${n}"`).join(', ');
                        return `📋 Found ${total} ${args.doctype} record(s). Use EXACT names in quotes:\n\nFirst available: "${names[0]}"\n\nAll records: ${quotedNames}${total > 15 ? ' (showing first 15)' : ''}`;
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
                                error: (err) => resolve(null) // Don't reject, just return null
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

        // Prioritize visible buttons
        const visibleButtons = buttons.filter(':visible');
        if (visibleButtons.length > 0) return visibleButtons[0];

        return buttons.length > 0 ? buttons[0] : null;
    }

    analyzeScreen(purpose) {
        const route = frappe.get_route();
        const routeStr = frappe.get_route_str();
        const title = document.title.replace(' - ERPNext', '').trim();
        const viewType = route[0]; // List, Form, etc.
        const docType = route[1];

        // 1. Identify Context
        let contextSummary = `📄 **Page**: ${title}\n📍 **Type**: ${viewType} View (${docType})`;

        // 2. Extract Key Actions (Buttons) - Filtered & Cleaned
        // Common standard buttons to ignore in summary unless needed
        const ignoredButtons = ['Help', 'Menu', 'Toggle Theme', 'Close', 'Minimize', 'User', 'Notifications', 'Reload'];

        const keyButtons = $('button')
            .not('.ai-agent-widget button, .dropdown-menu button') // Exclude widget & hidden dropdowns
            .filter(':visible')
            .map(function () { return $(this).text().trim(); })
            .get()
            .filter(text => text && text.length > 2 && !ignoredButtons.some(ig => text.includes(ig)))
            .slice(0, 8); // Top 8 relevant buttons

        const actionSummary = keyButtons.length ? `\n🔘 **Actions**: ${keyButtons.join(', ')}` : '';

        // 3. Form Details (if open)
        let dataSummary = '';
        if (cur_frm && cur_frm.docname) {
            const status = cur_frm.doc.status || cur_frm.doc.docstatus === 1 ? 'Submitted' : 'Draft';
            dataSummary = `\n📝 **Document**: ${cur_frm.docname} (${status})`;

            // Get key fields (mandatory or with values)
            const importantFields = Object.keys(cur_frm.fields_dict)
                .filter(k => {
                    const f = cur_frm.fields_dict[k];
                    return f.df.reqd || (cur_frm.doc[k] && !['owner', 'creation', 'modified', 'docstatus'].includes(k));
                })
                .slice(0, 10);

            if (importantFields.length > 0) {
                const fieldValues = importantFields.map(k => `${cur_frm.fields_dict[k].df.label}: ${cur_frm.doc[k] || '(empty)'}`).join(', ');
                dataSummary += `\n📋 **Key Data**: ${fieldValues}`;
            }
        }

        // 4. List View Details (if active)
        if (viewType === 'List' && frappe.views.list_view && frappe.views.list_view.data) {
            const totalCount = frappe.views.list_view.data.length || 0;
            dataSummary = `\n📋 **List Data**: Showing ${totalCount} records.`;
        }

        // 5. Workspace/Dashboard Details
        if ($('.widget-group').length > 0) {
            const shortcuts = $('.widget-shortcut .widget-title').filter(':visible').map((i, el) => $(el).text().trim()).get().slice(0, 8);
            const cards = $('.widget-card .widget-title').filter(':visible').map((i, el) => $(el).text().trim()).get().slice(0, 5);
            const charts = $('.widget-chart .widget-title').filter(':visible').map((i, el) => $(el).text().trim()).get().slice(0, 3);

            if (shortcuts.length || cards.length || charts.length) {
                dataSummary += `\n📌 **Dashboard Contents**:`;
                if (shortcuts.length) dataSummary += `\n   • Shortcuts: ${shortcuts.join(', ')}`;
                if (cards.length) dataSummary += `\n   • Cards: ${cards.join(', ')}`;
                if (charts.length) dataSummary += `\n   • Charts: ${charts.join(', ')}`;
            }
        }

        return `📊 **Screen Analysis** (${purpose})\n${contextSummary}${dataSummary}${actionSummary}`;
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
                errors.push(`Missing mandatory fields: ${fieldNames} `);
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
                                errors.push(`Row ${idx + 1} in ${tableField.label}: Missing ${missingInRow.join(', ')} `);
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

    showExportModal() {
        // Build conversation data from all messages
        const conversationData = this.buildConversationExport();

        if (!conversationData || conversationData.total_messages === 0) {
            frappe.msgprint('No conversation to export.');
            return;
        }

        const totalMessages = conversationData.total_messages;
        const totalActions = conversationData.total_actions;
        const firstMessage = conversationData.first_message || 'N/A';
        const duration = conversationData.duration || '0s';

        const dialog = new frappe.ui.Dialog({
            title: 'Export Conversation Report',
            fields: [
                {
                    fieldtype: 'HTML',
                    options: `
                        <div style="padding: 10px;">
                            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); 
                                        color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;
                                        box-shadow: 0 4px 6px rgba(139, 92, 246, 0.2);">
                                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 12px;">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                    <div>
                                        <h3 style="margin: 0; font-size: 20px; font-weight: 600;">Nutaan AI Conversation</h3>
                                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;">Complete Chat History</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                                <div style="background: #f8f4ff; padding: 15px; border-radius: 8px; border-left: 3px solid #8b5cf6;">
                                    <div style="font-size: 12px; color: #8b5cf6; font-weight: 600; margin-bottom: 5px;">MESSAGES</div>
                                    <div style="font-size: 24px; font-weight: 700; color: #1f2937;">${totalMessages}</div>
                                </div>
                                <div style="background: #f8f4ff; padding: 15px; border-radius: 8px; border-left: 3px solid #8b5cf6;">
                                    <div style="font-size: 12px; color: #8b5cf6; font-weight: 600; margin-bottom: 5px;">ACTIONS</div>
                                    <div style="font-size: 24px; font-weight: 700; color: #1f2937;">${totalActions}</div>
                                </div>
                                <div style="background: #f8f4ff; padding: 15px; border-radius: 8px; border-left: 3px solid #8b5cf6; grid-column: span 2;">
                                    <div style="font-size: 12px; color: #8b5cf6; font-weight: 600; margin-bottom: 5px;">SESSION</div>
                                    <div style="font-size: 24px; font-weight: 700; color: #1f2937;">${duration}</div>
                                </div>
                            </div>
                            
                            <div style="background: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <div style="font-size: 12px; color: #6b7280; font-weight: 600; margin-bottom: 8px;">FIRST REQUEST</div>
                                <div style="color: #374151; font-size: 14px; line-height: 1.5;">${firstMessage}</div>
                            </div>
                        </div >
    `
                }
            ],
            primary_action_label: '📥 Download PDF Report',
            primary_action: () => {
                this.exportConversationPDF(conversationData);
                dialog.hide();
            }
        });

        dialog.show();
    }

    buildConversationExport() {
        // Build export data from all messages
        if (!this.messages || this.messages.length === 0) {
            return null;
        }

        const userMessages = this.messages.filter(m => m.role === 'user');
        const assistantMessages = this.messages.filter(m => m.role === 'assistant');

        // Count total actions from tool calls
        let totalActions = 0;
        assistantMessages.forEach(msg => {
            if (msg.toolCalls && msg.toolCalls.length > 0) {
                totalActions += msg.toolCalls.length;
            }
        });

        // Get first user message
        const firstUserMsg = userMessages.length > 0 ? userMessages[0].content : 'N/A';

        // Calculate duration (from first to last message)
        let duration = '0s';
        if (this.messages.length >= 2) {
            const firstTime = new Date(this.messages[1].timestamp); // Skip welcome message
            const lastTime = new Date(this.messages[this.messages.length - 1].timestamp);
            const durationSec = Math.round((lastTime - firstTime) / 1000);
            const minutes = Math.floor(durationSec / 60);
            const seconds = durationSec % 60;
            duration = minutes > 0 ? `${minutes}m ${seconds} s` : `${seconds} s`;
        }

        return {
            conversation_id: `CONV_${Date.now()} `,
            total_messages: this.messages.length - 1, // Exclude welcome message
            total_actions: totalActions,
            first_message: firstUserMsg,
            duration: duration,
            messages: this.messages.slice(1), // Exclude welcome message
            timestamp: new Date().toISOString()
        };
    }

    async exportConversationPDF(conversationData) {
        if (!conversationData) {
            frappe.msgprint('No conversation data available.');
            return;
        }

        frappe.dom.freeze('Generating conversation PDF...');

        try {
            // Step  1: Generate PDF and get temp key
            const exportResponse = await fetch('/api/method/ai_agent_widget.api.export_session_pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': frappe.csrf_token
                },
                body: JSON.stringify({
                    session_data: JSON.stringify(conversationData)
                })
            });

            if (!exportResponse.ok) {
                throw new Error(`Server error: ${exportResponse.status} `);
            }

            const exportData = await exportResponse.json();
            const exportResult = exportData.message || exportData;

            if (!exportResult.success || !exportResult.temp_key) {
                throw new Error(exportResult.error || 'Failed to generate PDF');
            }

            // Step 2: Download PDF using temp key
            const downloadResponse = await fetch('/api/method/ai_agent_widget.api.download_session_pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': frappe.csrf_token
                },
                body: JSON.stringify({
                    session_id: exportResult.session_id,
                    temp_key: exportResult.temp_key
                })
            });

            if (!downloadResponse.ok) {
                throw new Error('Failed to download PDF');
            }

            // Get PDF as blob
            const blob = await downloadResponse.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Nutaan_AI_Conversation_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            frappe.show_alert({
                message: '✅ Conversation PDF downloaded successfully',
                indicator: 'green'
            }, 3);

        } catch (error) {
            console.error('Export error:', error);
            frappe.msgprint({
                title: 'Export Failed',
                message: `Error: ${error.message} `,
                indicator: 'red'
            });
        } finally {
            frappe.dom.unfreeze();
        }
    }

    async exportPDF() {
        if (!this.currentSessionData) {
            frappe.msgprint('No session data available.');
            return;
        }

        frappe.dom.freeze('Generating PDF report...');

        try {
            // Step 1: Generate PDF and get temp key
            const exportResponse = await fetch('/api/method/ai_agent_widget.api.export_session_pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': frappe.csrf_token
                },
                body: JSON.stringify({
                    session_data: JSON.stringify(this.currentSessionData)
                })
            });

            if (!exportResponse.ok) {
                throw new Error(`Server error: ${exportResponse.status} `);
            }

            const exportData = await exportResponse.json();
            const exportResult = exportData.message || exportData;

            if (!exportResult.success || !exportResult.temp_key) {
                throw new Error(exportResult.error || 'Failed to generate PDF');
            }

            // Step 2: Download PDF using temp key
            const downloadResponse = await fetch('/api/method/ai_agent_widget.api.download_session_pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': frappe.csrf_token
                },
                body: JSON.stringify({
                    session_id: exportResult.session_id,
                    temp_key: exportResult.temp_key
                })
            });

            if (!downloadResponse.ok) {
                throw new Error('Failed to download PDF');
            }

            // Get PDF as blob
            const blob = await downloadResponse.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Nutaan_AI_Report_${exportResult.session_id.substring(0, 8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            frappe.show_alert({
                message: '✅ PDF report downloaded successfully',
                indicator: 'green'
            }, 3);

        } catch (error) {
            console.error('Export error:', error);
            frappe.msgprint({
                title: 'Export Failed',
                message: `Error: ${error.message} `,
                indicator: 'red'
            });
        } finally {
            frappe.dom.unfreeze();
        }
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
