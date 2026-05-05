import * as vscode from 'vscode';
import { tokenize } from '../language/tokenizer';
import { parse } from '../language/parser';
import { validate, CognitiveIssue, IssueSeverity } from '../language/validator';
import { transpileToPython } from '../language/transpiler/python';
import { transpileToGDScript } from '../language/transpiler/gdscript';
import { transpileToCpp } from '../language/transpiler/cpp';

export class PreviewPanel {
  public static currentPanel: PreviewPanel | undefined;
  public static readonly viewType = 'eplusPreview';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _currentTarget: 'python' | 'cpp' | 'gdscript' = 'python';
  private _lastEPlusCode: string = '';
  private _lastTranspiledCode: string = '';
  private _issues: CognitiveIssue[] = [];

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel._panel.reveal(column);
      PreviewPanel.currentPanel._update();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      PreviewPanel.viewType,
      'E+ Live Preview',
      column || vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(extensionPath)],
        retainContextWhenHidden: true
      }
    );

    PreviewPanel.currentPanel = new PreviewPanel(panel, extensionPath);
  }

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;
    this._extensionPath = extensionPath;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'setTarget':
            this._currentTarget = message.target;
            this._update();
            return;
          case 'copyCode':
            vscode.env.clipboard.writeText(this._lastTranspiledCode);
            vscode.window.showInformationMessage('Code copied to clipboard!');
            return;
        }
      },
      null,
      this._disposables
    );

    vscode.window.onDidChangeActiveTextEditor(
      editor => {
        if (editor && editor.document.languageId === 'eplus') {
          this._update();
        }
      },
      null,
      this._disposables
    );

    vscode.workspace.onDidChangeTextDocument(
      event => {
        if (event.document.languageId === 'eplus') {
          setTimeout(() => this._update(), 300); // Debounce
        }
      },
      null,
      this._disposables
    );

    this._update();
  }

  public dispose() {
    PreviewPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'eplus') {
      this._panel.webview.html = this._getHtmlForNoFile();
      return;
    }

    const eplusCode = editor.document.getText();
    this._lastEPlusCode = eplusCode;

    // Parse and validate
    let transpiledCode = '';
    this._issues = [];

    try {
      const tokens = tokenize(eplusCode);
      const ast = parse(tokens);
      
      // Validate and collect issues
      const validationResult = validate(ast);
      this._issues = validationResult.issues;

      // Transpile based on target
      switch (this._currentTarget) {
        case 'python':
          transpiledCode = transpileToPython(ast);
          break;
        case 'gdscript':
          transpiledCode = transpileToGDScript(ast);
          break;
        case 'cpp':
          transpiledCode = transpileToCpp(ast);
          break;
      }
      
      this._lastTranspiledCode = transpiledCode;
    } catch (error: any) {
      transpiledCode = `// Error during processing:\n// ${error.message}`;
      this._lastTranspiledCode = transpiledCode;
    }

    this._panel.webview.html = this._getHtmlForWebview(
      eplusCode,
      transpiledCode,
      this._currentTarget,
      this._issues
    );
  }

  private _getHtmlForNoFile(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E+ Live Preview</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      padding: 2rem;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      opacity: 0.7;
    }
    .empty-state h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--vscode-descriptionForeground);
    }
    .empty-state p {
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="empty-state">
    <h2>No E+ File Open</h2>
    <p>Open or create an E+ file (.eplus) to see live preview</p>
  </div>
</body>
</html>`;
  }

  private _getHtmlForWebview(
    eplusCode: string,
    transpiledCode: string,
    target: string,
    issues: CognitiveIssue[]
  ): string {
    const issueCount = issues.length;
    const errorCount = issues.filter(i => i.severity === IssueSeverity.Error).length;
    const warningCount = issues.filter(i => i.severity === IssueSeverity.Warning).length;

    const issuesHtml = issues.map(issue => {
      const severityClass = issue.severity === IssueSeverity.Error ? 'issue-error' : 'issue-warning';
      const severityIcon = issue.severity === IssueSeverity.Error ? '✕' : '⚠';
      return `
        <div class="issue ${severityClass}">
          <div class="issue-header">
            <span class="issue-icon">${severityIcon}</span>
            <span class="issue-line">Line ${issue.line}</span>
            <span class="issue-rule">Rule ${issue.ruleNumber}</span>
          </div>
          <div class="issue-message">${issue.message}</div>
          ${issue.suggestion ? `<div class="issue-suggestion">💡 ${issue.suggestion}</div>` : ''}
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E+ Live Preview</title>
  <style>
    :root {
      --bg-primary: var(--vscode-editor-background, #1e1e1e);
      --bg-secondary: var(--vscode-sideBar-background, #252526);
      --border: var(--vscode-widget-border, #454545);
      --text-primary: var(--vscode-editor-foreground, #d4d4d4);
      --text-secondary: var(--vscode-descriptionForeground, #858585);
      --accent: #4af0a0;
      --accent2: #5b9cf6;
      --error: #f06a4a;
      --warning: #f5c518;
      --code-bg: var(--vscode-textCodeBlock-background, #1e1e1e);
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-primary);
      background: var(--bg-primary);
      height: 100vh;
      overflow: hidden;
    }
    
    .container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      gap: 12px;
    }
    
    .target-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .target-selector label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .target-selector select {
      background: var(--bg-primary);
      color: var(--text-primary);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
    }
    
    .status-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
    }
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
    }
    
    .status-indicator.warning { background: var(--warning); }
    .status-indicator.error { background: var(--error); }
    
    .copy-btn {
      background: var(--accent);
      color: #0b0d12;
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .copy-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-right: 1px solid var(--border);
    }
    
    .panel:last-child {
      border-right: none;
    }
    
    .panel-header {
      padding: 10px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .panel-title {
      font-weight: 600;
    }
    
    .code-container {
      flex: 1;
      overflow: auto;
      padding: 16px;
      background: var(--code-bg);
    }
    
    pre {
      margin: 0;
      font-family: 'DM Mono', 'Consolas', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.7;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .issues-panel {
      max-height: 200px;
      overflow-y: auto;
      border-top: 1px solid var(--border);
      background: var(--bg-secondary);
    }
    
    .issues-header {
      padding: 10px 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary);
      font-weight: 600;
      border-bottom: 1px solid var(--border);
    }
    
    .issues-list {
      padding: 0;
    }
    
    .issue {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
    }
    
    .issue:last-child {
      border-bottom: none;
    }
    
    .issue-error {
      background: rgba(240, 106, 74, 0.08);
      border-left: 3px solid var(--error);
    }
    
    .issue-warning {
      background: rgba(245, 197, 24, 0.08);
      border-left: 3px solid var(--warning);
    }
    
    .issue-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 11px;
    }
    
    .issue-icon {
      font-weight: bold;
    }
    
    .issue-error .issue-icon { color: var(--error); }
    .issue-warning .issue-icon { color: var(--warning); }
    
    .issue-line {
      color: var(--text-secondary);
    }
    
    .issue-rule {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 3px;
      color: var(--text-secondary);
    }
    
    .issue-message {
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    
    .issue-suggestion {
      color: var(--accent2);
      font-style: italic;
      font-size: 11px;
    }
    
    .no-issues {
      padding: 16px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="toolbar">
      <div class="target-selector">
        <label>Target:</label>
        <select id="targetSelect" onchange="handleTargetChange()">
          <option value="python" ${target === 'python' ? 'selected' : ''}>Python</option>
          <option value="gdscript" ${target === 'gdscript' ? 'selected' : ''}>GDScript</option>
          <option value="cpp" ${target === 'cpp' ? 'selected' : ''}>C++</option>
        </select>
      </div>
      <div class="status-bar">
        <div class="status-item">
          <div class="status-indicator ${issueCount === 0 ? '' : errorCount > 0 ? 'error' : 'warning'}"></div>
          <span>${issueCount === 0 ? 'All good!' : `${errorCount} errors, ${warningCount} warnings`}</span>
        </div>
        <button class="copy-btn" onclick="handleCopy()">Copy Code</button>
      </div>
    </div>
    
    <div class="main-content">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🗣 E+ Source</span>
          <span>${eplusCode.split('\n').length} lines</span>
        </div>
        <div class="code-container">
          <pre><code>${this._escapeHtml(eplusCode)}</code></pre>
        </div>
      </div>
      
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">📝 ${target.charAt(0).toUpperCase() + target.slice(1)} Output</span>
          <span>${transpiledCode.split('\n').length} lines</span>
        </div>
        <div class="code-container">
          <pre><code>${this._escapeHtml(transpiledCode)}</code></pre>
        </div>
      </div>
    </div>
    
    ${issueCount > 0 ? `
    <div class="issues-panel">
      <div class="issues-header">
        ⚠ Cognitive Issues (${issueCount})
      </div>
      <div class="issues-list">
        ${issuesHtml}
      </div>
    </div>
    ` : `
    <div class="issues-panel">
      <div class="no-issues">
        ✓ No cognitive issues detected. Code follows E+ philosophy.
      </div>
    </div>
    `}
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    
    function handleTargetChange() {
      const select = document.getElementById('targetSelect');
      vscode.postMessage({
        command: 'setTarget',
        target: select.value
      });
    }
    
    function handleCopy() {
      vscode.postMessage({
        command: 'copyCode'
      });
    }
  </script>
</body>
</html>`;
  }

  private _escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
