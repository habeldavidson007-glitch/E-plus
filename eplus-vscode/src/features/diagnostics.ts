import * as vscode from 'vscode';
import { tokenize } from '../language/tokenizer';
import { parse } from '../language/parser';
import { validate } from '../language/validator';

export function registerDiagnostics(
    context: vscode.ExtensionContext,
    diagnosticCollection: vscode.DiagnosticCollection
) {
    // Initial validation for open documents
    for (const editor of vscode.window.visibleTextEditors) {
        if (editor.document.languageId === 'eplus') {
            updateDiagnostics(editor.document, diagnosticCollection);
        }
    }

    // Update on document change
    const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'eplus') {
            updateDiagnostics(event.document, diagnosticCollection);
        }
    });

    // Update on document close
    const closeListener = vscode.workspace.onDidCloseTextDocument((document) => {
        if (document.languageId === 'eplus') {
            diagnosticCollection.delete(document.uri);
        }
    });

    context.subscriptions.push(changeListener, closeListener);
}

function updateDiagnostics(
    document: vscode.TextDocument,
    diagnosticCollection: vscode.DiagnosticCollection
) {
    const text = document.getText();
    const diagnostics: vscode.Diagnostic[] = [];

    try {
        const tokens = tokenize(text);
        const ast = parse(tokens);
        const issues = validate(ast);

        for (const issue of issues) {
            const line = issue.line || 0;
            const lineText = document.lineAt(line).text;
            const range = new vscode.Range(line, 0, line, lineText.length);

            const diagnostic = new vscode.Diagnostic(
                range,
                issue.message,
                issue.severity === 'error' 
                    ? vscode.DiagnosticSeverity.Error 
                    : vscode.DiagnosticSeverity.Warning
            );

            diagnostic.source = 'E+ Cognitive Validator';
            diagnostic.code = 'cognitive-rule';

            // Add suggestion as code action hint
            if (issue.suggestion) {
                diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];
            }

            diagnostics.push(diagnostic);
        }
    } catch (error) {
        // Handle parse errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
        
        // Try to extract line number from error
        let errorLine = 0;
        const lineMatch = errorMessage.match(/line (\d+)/i);
        if (lineMatch) {
            errorLine = parseInt(lineMatch[1], 10) - 1;
        }

        const lineText = document.lineAt(Math.min(errorLine, document.lineCount - 1)).text;
        const range = new vscode.Range(errorLine, 0, errorLine, lineText.length);

        const diagnostic = new vscode.Diagnostic(
            range,
            errorMessage,
            vscode.DiagnosticSeverity.Error
        );

        diagnostic.source = 'E+ Parser';
        diagnostics.push(diagnostic);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}
