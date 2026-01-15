# AI Agent Widget

Universal frontend widget for AI agent chat interface. Works with any website.

## Features

- 🎨 **Beautiful UI** - Modern chat interface with glassmorphism
- ⚡ **Real-time Updates** - See AI actions step-by-step
- 🔧 **11 Built-in Tools** - Navigate, create, edit, analyze
- 🎯 **Context Aware** - Understands current page state
- 📱 **Responsive** - Works on desktop and mobile
- 🎨 **Customizable** - Easy to theme and style

## Installation

### Option 1: Direct Include (CDN-ready)
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="dist/ai-widget.css">
</head>
<body>
    <script src="dist/ai-widget.js"></script>
    <script>
        // Widget auto-initializes
        // Configure your backend endpoint in widget.js
    </script>
</body>
</html>
```

### Option 2: NPM Package (Future)
```bash
npm install @tecosys/ai-agent-widget
```

```javascript
import AIWidget from '@tecosys/ai-agent-widget';
import '@tecosys/ai-agent-widget/dist/ai-widget.css';

AIWidget.init({
    apiUrl: 'https://your-backend.com/api/agent',
    apiKey: 'your-api-key'
});
```

## Configuration

The widget connects to a backend API endpoint. Configure in `src/widget.js`:

```javascript
// Line 290-306 in widget.js
const response = await fetch('/api/method/ai_agent_widget.api.agent_stream', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': frappe.csrf_token  // Adjust for your backend
    },
    body: JSON.stringify({
        message: message,
        context: {...},
        history: [...]
    })
});
```

### Backend API Requirements

Your backend must provide an endpoint that:

**Request:**
```json
{
    "message": "User command",
    "context": {
        "currentPath": "/current/page",
        "user": "username"
    },
    "history": [
        {"role": "user", "content": "..."},
        {"role": "assistant", "content": "..."}
    ]
}
```

**Response:**
```json
{
    "success": true,
    "tool_calls": [
        {"name": "navigate", "args": {"doctype": "Sales Order"}}
    ],
    "agent_steps": [
        {"type": "tool_call", "tool": "navigate", "args": {...}},
        {"type": "response", "content": "Done"}
    ],
    "content": "Navigated to Sales Order"
}
```

## Customization

### Styling

Edit `src/widget.css` to customize:

```css
/* Change colors */
.ai-agent-float-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Change size */
.ai-agent-window {
    width: 450px;
    height: 650px;
}
```

### Widget Position

```css
.ai-agent-widget {
    bottom: 24px;  /* Distance from bottom */
    right: 24px;   /* Distance from right */
}
```

## Usage Examples

### Standalone HTML
See `examples/standalone.html` for complete example.

### React Integration (Future)
```jsx
import { AIWidget } from '@tecosys/ai-agent-widget/react';

function App() {
    return (
        <div>
            <h1>My App</h1>
            <AIWidget 
                apiUrl="https://api.example.com/agent"
                apiKey="your-key"
            />
        </div>
    );
}
```

## File Structure

```
widget/
├── src/
│   ├── widget.js        # Source JavaScript (744 lines)
│   └── widget.css       # Source CSS (352 lines)
├── dist/
│   ├── ai-widget.js     # Production-ready
│   └── ai-widget.css    # Production-ready
├── examples/
│   └── standalone.html  # Usage example
├── package.json
└── README.md
```

## Features in Detail

### Chat Interface
- Floating button (bottom-right)
- Expandable chat window
- Message history with localStorage
- Tool execution visualization
- Quick action buttons

### Tool Visualization
Shows each AI action in real-time:
- ⚡ Tool name
- ✅ Execution result
- ⏱️ Execution status

### Responsive Design
- Desktop: 450x650px window
- Mobile: Full screen with padding
- Touch-friendly buttons

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile browsers: ✅ iOS Safari, Chrome Mobile

## Development

### Making Changes

1. Edit `src/widget.js` or `src/widget.css`
2. Copy to `dist/`:
   ```bash
   cp src/widget.js dist/ai-widget.js
   cp src/widget.css dist/ai-widget.css
   ```
3. Test in `examples/standalone.html`

### Building for Production

Currently no build step needed - pure vanilla JS/CSS.

Future: Add minification:
```bash
npm run build  # Will minify and optimize
```

## Integration with Backend

This widget works with:
- **AI Agent SDK** (`../sdk/`) - Python backend
- **Frappe Integration** (`../integrations/frappe/`) - ERPNext
- **Custom Backends** - Any API following the spec

## License

MIT

## Links

- [Main Repository](../README.md)
- [SDK Documentation](../sdk/README.md)
- [Frappe Integration](../integrations/frappe/README.md)
