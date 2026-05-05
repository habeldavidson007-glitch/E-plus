import * as vscode from 'vscode';
import { tokenize } from '../language/tokenizer';
import { parse } from '../language/parser';
import { validate, IssueSeverity } from '../language/validator';

export class DiagnosticsProvider implements vscode.CodeActionProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('eplus');
  }

  public updateDiagnostics(document: vscode.TextDocument): void {
    if (document.languageId !== 'eplus') {
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const code = document.getText();

    try {
      const tokens = tokenize(code);
      const ast = parse(tokens);
      const result = validate(ast);

      for (const issue of result.issues) {
        if (!issue.line) continue;

        const lineNum = issue.line - 1; // Convert to 0-based
        if (lineNum < 0 || lineNum >= document.lineCount) continue;

        const line = document.lineAt(lineNum);
        const range = new vscode.Range(lineNum, 0, lineNum, line.text.length);

        const diagnostic = new vscode.Diagnostic(
          range,
          `${issue.message} (Rule ${issue.ruleNumber})`,
          issue.severity === IssueSeverity.Error 
            ? vscode.DiagnosticSeverity.Error 
            : vscode.DiagnosticSeverity.Warning
        );

        diagnostic.code = `E+ Rule ${issue.ruleNumber}`;
        diagnostic.source = 'E+ Validator';
        
        if (issue.suggestion) {
          diagnostic.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(
              new vscode.Location(document.uri, range),
              `💡 ${issue.suggestion}`
            )
          ];
        }

        diagnostics.push(diagnostic);
      }
    } catch (error: any) {
      // Add parse error as diagnostic
      const line = error.line || 0;
      const range = new vscode.Range(line, 0, line, 10);
      const diagnostic = new vscode.Diagnostic(
        range,
        `Parse Error: ${error.message}`,
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = 'E+ Parser';
      diagnostics.push(diagnostic);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  public clear(): void {
    this.diagnosticCollection.clear();
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source === 'E+ Validator') {
        const action = new vscode.CodeAction(
          'Split into simpler cognitive steps',
          vscode.CodeActionKind.QuickFix
        );
        action.edit = new vscode.WorkspaceEdit();
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        actions.push(action);
      }
    }

    return actions;
  }
}

export function activateDiagnostics(context: vscode.ExtensionContext): DiagnosticsProvider {
  const provider = new DiagnosticsProvider();
  
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      'eplus',
      provider,
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
      }
    )
  );

  vscode.workspace.onDidChangeTextDocument(event => {
    provider.updateDiagnostics(event.document);
  });

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      provider.updateDiagnostics(editor.document);
    }
  });

  for (const document of vscode.workspace.textDocuments) {
    provider.updateDiagnostics(document);
  }

  return provider;
}
