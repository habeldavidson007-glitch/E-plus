import * as vscode from 'vscode';
import { tokenize } from './language/tokenizer';
import { parse } from './language/parser';
import { validate, validateWithDefaults } from './language/validator';
import { transpileToPython } from './language/transpiler/python';
import { transpileToCpp } from './language/transpiler/cpp';
import { transpileToGdscript } from './language/transpiler/gdscript';
import { PreviewPanel } from './ui/webview';
import { registerHoverProvider } from './features/hover';
import { activateDiagnostics } from './features/diagnostics';
import { registerCodeActions } from './features/codeActions';
import { registerFormatter } from './features/formatter';

let diagnosticCollection: vscode.DiagnosticCollection;
let previewPanel: PreviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('E+ Language extension is now active');

    // Register diagnostic collection
    diagnosticCollection = vscode.languages.createDiagnosticCollection('eplus');
    context.subscriptions.push(diagnosticCollection);

    // Register language features
    registerHoverProvider(context);
    activateDiagnostics(context);
    registerCodeActions(context);
    registerFormatter(context);

    // Register commands
    const previewCommand = vscode.commands.registerCommand('eplus.preview', () => {
        if (!previewPanel) {
            previewPanel = new PreviewPanel(context);
        }
        previewPanel.show();
        updatePreview();
    });

    const buildCommand = vscode.commands.registerCommand('eplus.build', async () => {
        await buildCurrentFile();
    });

    const validateCommand = vscode.commands.registerCommand('eplus.validate', () => {
        runValidation();
    });

    context.subscriptions.push(previewCommand, buildCommand, validateCommand);

    // Listen for document changes
    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (event.document.languageId === 'eplus') {
                runValidation();
                updatePreview();
            }
        },
        null,
        context.subscriptions
    );

    // Initial validation on open
    vscode.window.visibleTextEditors.forEach((editor) => {
        if (editor.document.languageId === 'eplus') {
            runValidation();
        }
    });
}

async function runValidation() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'eplus') {
        return;
    }

    const document = editor.document;
    const text = document.getText();

    try {
        const tokens = tokenize(text);
        const ast = parse(tokens);
        const result = validate(ast);
        const issues = result.issues;

        const diagnostics: vscode.Diagnostic[] = [];
        for (const issue of issues) {
            const line = issue.line || 0;
            const range = new vscode.Range(line, 0, line, document.lineAt(line).text.length);
            const diagnostic = new vscode.Diagnostic(
                range,
                issue.message,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.source = 'E+ Cognitive Validator';
            diagnostics.push(diagnostic);
        }

        diagnosticCollection.set(document.uri, diagnostics);
    } catch (error) {
        console.error('Validation error:', error);
    }
}

function updatePreview() {
    if (!previewPanel) {
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'eplus') {
        return;
    }

    const text = editor.document.getText();
    const config = vscode.workspace.getConfiguration('eplus');
    const targetLanguage = config.get<string>('targetLanguage', 'python');

    try {
        const tokens = tokenize(text);
        const ast = parse(tokens);
        let output = '';

        switch (targetLanguage) {
            case 'cpp':
                output = transpileToCpp(ast);
                break;
            case 'gdscript':
                output = transpileToGdscript(ast);
                break;
            default:
                output = transpileToPython(ast);
        }

        previewPanel.update(output, targetLanguage);
    } catch (error) {
        previewPanel.update(`Error: ${error}`, 'error');
    }
}

async function buildCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'eplus') {
        vscode.window.showWarningMessage('No E+ file open');
        return;
    }

    const document = editor.document;
    const text = document.getText();
    const config = vscode.workspace.getConfiguration('eplus');
    const targetLanguage = config.get<string>('targetLanguage', 'python');

    try {
        const tokens = tokenize(text);
        const ast = parse(tokens);
        let output = '';
        let extension = '.py';

        switch (targetLanguage) {
            case 'cpp':
                output = transpileToCpp(ast);
                extension = '.cpp';
                break;
            case 'gdscript':
                output = transpileToGdscript(ast);
                extension = '.gd';
                break;
            default:
                output = transpileToPython(ast);
        }

        const saveDialogOptions = {
            defaultUri: vscode.Uri.file(document.fileName.replace(/\.e\+?$/, extension)),
            saveLabel: 'Build',
            filters: {
                'Source Files': [extension.replace('.', '')]
            }
        };
        const uri = await vscode.window.showSaveDialog(saveDialogOptions);

        if (uri) {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(output));
            vscode.window.showInformationMessage(`Built to ${uri.fsPath}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Build failed: ${error}`);
    }
}

export function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
    if (previewPanel) {
        previewPanel.dispose();
    }
}
