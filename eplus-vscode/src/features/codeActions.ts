import * as vscode from 'vscode';

export function registerCodeActions(context: vscode.ExtensionContext) {
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        'eplus',
        {
            provideCodeActions(
                document: vscode.TextDocument,
                range: vscode.Range | vscode.Selection,
                context: vscode.CodeActionContext,
                token: vscode.CancellationToken
            ): vscode.CodeAction[] {
                const actions: vscode.CodeAction[] = [];

                // Check for cognitive validation issues
                for (const diagnostic of context.diagnostics) {
                    if (diagnostic.source === 'E+ Cognitive Validator') {
                        const splitAction = createSplitAction(document, diagnostic);
                        if (splitAction) {
                            actions.push(splitAction);
                        }
                    }
                }

                return actions;
            }
        },
        {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        }
    );

    context.subscriptions.push(codeActionProvider);
}

function createSplitAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
): vscode.CodeAction | null {
    const message = diagnostic.message.toLowerCase();

    // Handle "too many entities" suggestion
    if (message.includes('too many entities') || message.includes('split into separate steps')) {
        const action = new vscode.CodeAction(
            'Split into multiple lines (one thought per line)',
            vscode.CodeActionKind.QuickFix
        );

        const edit = new vscode.WorkspaceEdit();
        const lineText = document.lineAt(diagnostic.range.start.line).text;

        // Simple heuristic: split on operators
        const parts = lineText.split(/\s+(and|or|[+\-*/])\s+/);
        if (parts.length > 1) {
            const newLines = parts.map((part, i) => {
                if (i === 0) return part.trim();
                return `# continued: ${part.trim()}`;
            });

            edit.replace(
                document.uri,
                diagnostic.range,
                newLines.join('\n')
            );
        }

        action.edit = edit;
        action.isPreferred = true;
        return action;
    }

    // Handle "too many logical operators" suggestion
    if (message.includes('too many logical operators') || message.includes('split condition')) {
        const action = new vscode.CodeAction(
            'Split condition into sequential checks',
            vscode.CodeActionKind.QuickFix
        );

        const edit = new vscode.WorkspaceEdit();
        const lineText = document.lineAt(diagnostic.range.start.line).text;

        // Suggest splitting complex conditions
        const suggestion = `## Split this condition:\n# Step 1: Check first part\n# Step 2: Check second part`;

        edit.insert(
            document.uri,
            new vscode.Position(diagnostic.range.start.line, 0),
            suggestion + '\n'
        );

        action.edit = edit;
        action.documentation = new vscode.MarkdownString(
            'Break complex conditions into smaller, sequential checks for better readability.'
        );
        return action;
    }

    // Handle "too many parameters" suggestion
    if (message.includes('too many parameters')) {
        const action = new vscode.CodeAction(
            'Consider grouping parameters or splitting function',
            vscode.CodeActionKind.QuickFix
        );

        action.documentation = new vscode.MarkdownString(
            'Functions with too many parameters are hard to understand. Consider:\n\n' +
            '- Grouping related parameters into an object\n' +
            '- Splitting into smaller, focused functions\n' +
            '- Using builder pattern for complex configurations'
        );

        return action;
    }

    // Handle "too many arguments" suggestion
    if (message.includes('too many arguments')) {
        const action = new vscode.CodeAction(
            'Group related arguments or split call',
            vscode.CodeActionKind.QuickFix
        );

        action.documentation = new vscode.MarkdownString(
            'Function calls with many arguments reduce readability. Consider:\n\n' +
            '- Grouping related arguments into a single object/struct\n' +
            '- Breaking the operation into multiple smaller calls\n' +
            '- Using named parameters if supported by target language'
        );

        return action;
    }

    return null;
}
