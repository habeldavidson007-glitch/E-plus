import * as vscode from 'vscode';

export function registerFormatter(context: vscode.ExtensionContext) {
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('eplus', {
        provideDocumentFormattingEdits(
            document: vscode.TextDocument,
            options: vscode.FormattingOptions,
            token: vscode.CancellationToken
        ): vscode.TextEdit[] {
            const edits: vscode.TextEdit[] = [];
            const fullRange = new vscode.Range(
                new vscode.Position(0, 0),
                new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            );

            const formattedText = formatDocument(document.getText());
            edits.push(vscode.TextEdit.replace(fullRange, formattedText));

            return edits;
        }
    });

    context.subscriptions.push(formatter);
}

function formatDocument(text: string): string {
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    let indentLevel = 0;
    const indentString = '  '; // 2 spaces per indent

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Skip empty lines at the beginning
        if (line === '' && formattedLines.length === 0) {
            continue;
        }

        // Check for dedent markers (lines that should reduce indent)
        if (line.startsWith('else') || line.startsWith('→')) {
            // These don't change indent level but should be at current level
        }

        // Apply current indent
        if (line !== '') {
            line = indentString.repeat(indentLevel) + line;
        }

        // Check if this line increases indent (ends with →)
        if (line.includes('→') && !line.trim().startsWith('//') && !line.trim().startsWith('##')) {
            indentLevel++;
        }

        // Check if next line should dedent
        if (i < lines.length - 1) {
            const nextLine = lines[i + 1].trim();
            
            // Dedent for else, or when we see a line at lower indentation in source
            if (nextLine.startsWith('else')) {
                // Don't dedent yet, else is part of the same block structure
            }
        }

        formattedLines.push(line);
    }

    // Ensure single newline at end
    let result = formattedLines.join('\n');
    result = result.replace(/\n+$/, '\n');

    return result;
}

// Also register range formatter
export function registerRangeFormatter(context: vscode.ExtensionContext) {
    const rangeFormatter = vscode.languages.registerDocumentRangeFormattingEditProvider('eplus', {
        provideDocumentRangeFormattingEdits(
            document: vscode.TextDocument,
            range: vscode.Range,
            options: vscode.FormattingOptions,
            token: vscode.CancellationToken
        ): vscode.TextEdit[] {
            // For now, just format the whole document
            const fullRange = new vscode.Range(
                new vscode.Position(0, 0),
                new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            );

            const formattedText = formatDocument(document.getText());
            return [vscode.TextEdit.replace(fullRange, formattedText)];
        }
    });

    context.subscriptions.push(rangeFormatter);
}
