import * as vscode from 'vscode';

export function registerHoverProvider(context: vscode.ExtensionContext) {
    const hoverProvider = vscode.languages.registerHoverProvider('eplus', {
        provideHover(document, position, token): vscode.Hover | undefined {
            const range = document.getWordRangeAtPosition(position);
            if (!range) {
                return undefined;
            }

            const word = document.getText(range);
            const hoverText = getHoverText(word);

            if (hoverText) {
                return new vscode.Hover(new vscode.MarkdownString(hoverText));
            }

            return undefined;
        }
    });

    context.subscriptions.push(hoverProvider);
}

function getHoverText(word: string): string | null {
    const symbolDocs: Record<string, string> = {
        '?': '**Condition** — Checks a logical statement\n\n*Example:* `? (age > 17) →`',
        '<': '**Input** — Receive value from user\n\n*Example:* `name = < "Your name"`',
        '>': '**Output** — Express/show value\n\n*Example:* `> "Hello"`',
        '→': '**Flow Block** — Continuation into a block\n\nReplaces braces with a semantic arrow',
        'else': '**Fallback** — Natural continuation after condition\n\n*Example:* `else → > "Denied"`',
        'repeat': '**Iteration** — Loop through items\n\n*Example:* `repeat item → > item`',
        'call': '**Function Call** — Execute a function (readable mode)\n\n*Example:* `call greet("John")`',
        '^': '**Function Call** — Execute a function (compact mode)\n\n*Example:* `^greet("John")`',
        'return': '**Return** — Emit result from function\n\n*Example:* `return result`',
        '=>': '**Return** — Compact return syntax\n\n*Example:* `=> result`',
        'remove': '**Remove** — Delete a named value\n\n*Example:* `remove temp`',
        '##': '**Comment** — Human annotation layer\n\nNever affects execution',
        '@': '**Entity Declaration** — Marks a named entity (optional)\n\n*Example:* `@user = < "Name"`',
        '[': '**Function Definition** — Start of reusable thought\n\n*Example:* `[greet] (name) →`',
        ']': '**Function Definition** — End of function name',
        '~~': '**Remove** — Compact remove syntax\n\n*Example:* `~~temp`'
    };

    if (symbolDocs[word]) {
        return symbolDocs[word];
    }

    // Check for keywords
    const keywordDocs: Record<string, string> = {
        'else': '**Keyword** — Fallback branch\n\nMust follow a condition block',
        'repeat': '**Keyword** — Start iteration\n\nLoops through items or creates a sequence',
        'call': '**Keyword** — Call function\n\nReadable form of function invocation',
        'return': '**Keyword** — Return value\n\nEmits a result from a function',
        'remove': '**Keyword** — Remove variable\n\nDeletes a named value from scope',
        'in': '**Keyword** — Iteration helper\n\nUsed with repeat: `repeat x in items`',
        'true': '**Boolean** — True value',
        'false': '**Boolean** — False value'
    };

    if (keywordDocs[word.toLowerCase()]) {
        return keywordDocs[word.toLowerCase()];
    }

    return null;
}
