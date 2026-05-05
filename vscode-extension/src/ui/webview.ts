import * as vscode from 'vscode';

export class PreviewPanel {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public show() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'eplusPreview',
            'E+ Live Preview',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        }, null, this.context.subscriptions);
    }

    public update(content: string, language: string) {
        if (!this.panel) {
            return;
        }

        const highlightedCode = this.syntaxHighlight(content, language);

        this.panel.webview.html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E+ Preview - ${language.toUpperCase()}</title>
    <style>
        :root {
            --bg: #1e1e1e;
            --fg: #d4d4d4;
            --keyword: #569cd6;
            --string: #ce9178;
            --comment: #6a9955;
            --function: #dcdcaa;
            --number: #b5cea8;
            --operator: #d4d4d4;
        }
        
        body {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            background: var(--bg);
            color: var(--fg);
            margin: 0;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #333;
        }
        
        .header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
        
        .badge {
            background: #0e639c;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        pre {
            margin: 0;
            overflow-x: auto;
        }
        
        code {
            font-family: inherit;
        }
        
        .k { color: var(--keyword); }
        .s { color: var(--string); }
        .c { color: var(--comment); font-style: italic; }
        .fn { color: var(--function); }
        .n { color: var(--number); }
        .op { color: var(--operator); }
        
        .error {
            color: #f48771;
            background: rgba(244, 135, 113, 0.1);
            padding: 16px;
            border-radius: 6px;
            border-left: 3px solid #f48771;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Generated ${language.toUpperCase()} Code</h2>
        <span class="badge">${language}</span>
    </div>
    ${content === 'error' 
        ? '<div class="error">Error generating preview. Check the console for details.</div>'
        : `<pre><code>${highlightedCode}</code></pre>`
    }
</body>
</html>`;
    }

    private syntaxHighlight(code: string, language: string): string {
        // Simple syntax highlighting based on language
        let highlighted = this.escapeHtml(code);

        // Comments
        const commentPattern = language === 'python' || language === 'gdscript' 
            ? /(#.*$)/gm 
            : /(\/\/.*$)/gm;
        highlighted = highlighted.replace(commentPattern, '<span class="c">$1</span>');

        // Strings
        highlighted = highlighted.replace(/(".*?")/g, '<span class="s">$1</span>');

        // Keywords by language
        const keywords: Record<string, string[]> = {
            python: ['def', 'return', 'if', 'else', 'for', 'in', 'import', 'from', 'class', 'while', 'print', 'input'],
            cpp: ['int', 'auto', 'void', 'return', 'if', 'else', 'for', 'while', 'cout', 'cin', 'using', 'namespace', 'include'],
            gdscript: ['func', 'var', 'return', 'if', 'else', 'for', 'in', 'extends', 'print']
        };

        const kwList = keywords[language] || keywords.python;
        const kwPattern = new RegExp(`\\b(${kwList.join('|')})\\b`, 'g');
        highlighted = highlighted.replace(kwPattern, '<span class="k">$1</span>');

        // Function calls
        highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="fn">$1</span>(');

        // Numbers
        highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="n">$1</span>');

        return highlighted;
    }

    private escapeHtml(text: string): string {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    public dispose() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
    }
}
