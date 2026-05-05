export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

export enum TokenType {
    // Keywords
    ELSE = 'ELSE',
    REPEAT = 'REPEAT',
    CALL = 'CALL',
    RETURN = 'RETURN',
    REMOVE = 'REMOVE',
    IN = 'IN',
    FOREVER = 'FOREVER',
    SYS = 'SYS',
    TRUE = 'TRUE',
    FALSE = 'FALSE',
    
    // Symbols
    QUESTION = 'QUESTION',      // ?
    LT = 'LT',                  // <
    GT = 'GT',                  // >
    EQUALS = 'EQUALS',          // =
    FAT_ARROW = 'FAT_ARROW',    // =>
    LPAREN = 'LPAREN',          // (
    RPAREN = 'RPAREN',          // )
    LBRACKET = 'LBRACKET',      // [
    RBRACKET = 'RBRACKET',      // ]
    COMMA = 'COMMA',            // ,
    CARET = 'CARET',            // ^
    AT = 'AT',                  // @
    ARROW = 'ARROW',            // →
    TILDE_TILDE = 'TILDE_TILDE',// ~~
    PLUS = 'PLUS',              // +
    MINUS = 'MINUS',            // -
    STAR = 'STAR',              // *
    SLASH = 'SLASH',            // /
    GTE = 'GTE',                // >=
    LTE = 'LTE',                // <=
    EQ = 'EQ',                  // ==
    NEQ = 'NEQ',                // !=
    
    // Literals & Identifiers
    IDENT = 'IDENT',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    
    // Structure
    COMMENT = 'COMMENT',
    INDENT = 'INDENT',
    DEDENT = 'DEDENT',
    NEWLINE = 'NEWLINE',
    
    // End
    EOF = 'EOF'
}

const KEYWORDS: Record<string, TokenType> = {
    'else': TokenType.ELSE,
    'repeat': TokenType.REPEAT,
    'call': TokenType.CALL,
    'return': TokenType.RETURN,
    'remove': TokenType.REMOVE,
    'in': TokenType.IN,
    'forever': TokenType.FOREVER,
    'sys': TokenType.SYS,
    'true': TokenType.TRUE,
    'false': TokenType.FALSE
};

export function tokenize(source: string): Token[] {
    const tokens: Token[] = [];
    let pos = 0;
    let line = 1;
    let column = 1;
    let indentStack: number[] = [0];
    
    while (pos < source.length) {
        const char = source[pos];
        
        // Handle newline and indentation
        if (char === '\n') {
            tokens.push({ type: TokenType.NEWLINE, value: '\n', line, column });
            pos++;
            line++;
            column = 1;
            
            // Count leading spaces for indentation
            let indent = 0;
            while (pos < source.length && source[pos] === ' ') {
                indent++;
                pos++;
                column++;
            }
            
            // Skip if only whitespace on line
            if (pos < source.length && source[pos] !== '\n') {
                const currentIndent = indentStack[indentStack.length - 1];
                
                if (indent > currentIndent) {
                    indentStack.push(indent);
                    tokens.push({ type: TokenType.INDENT, value: '', line, column });
                } else if (indent < currentIndent) {
                    while (indentStack[indentStack.length - 1] > indent) {
                        indentStack.pop();
                        tokens.push({ type: TokenType.DEDENT, value: '', line, column });
                    }
                }
            }
            continue;
        }
        
        // Skip carriage return
        if (char === '\r') {
            pos++;
            column++;
            continue;
        }
        
        // Skip tabs (treat as error or convert to spaces)
        if (char === '\t') {
            pos++;
            column++;
            continue;
        }
        
        // Comments
        if (char === '#' && source[pos + 1] === '#') {
            const startColumn = column;
            let comment = '##';
            pos += 2;
            column += 2;
            
            while (pos < source.length && source[pos] !== '\n') {
                comment += source[pos];
                pos++;
                column++;
            }
            
            tokens.push({ type: TokenType.COMMENT, value: comment, line, column: startColumn });
            continue;
        }
        
        // Strings
        if (char === '"') {
            const startColumn = column;
            let str = '"';
            pos++;
            column++;
            
            while (pos < source.length && source[pos] !== '"') {
                if (source[pos] === '\\') {
                    str += source[pos];
                    pos++;
                    column++;
                }
                str += source[pos];
                pos++;
                column++;
            }
            
            str += '"';
            pos++;
            column++;
            
            tokens.push({ type: TokenType.STRING, value: str, line, column: startColumn });
            continue;
        }
        
        // Numbers
        if (/\d/.test(char)) {
            const startColumn = column;
            let num = '';
            
            while (pos < source.length && /\d/.test(source[pos])) {
                num += source[pos];
                pos++;
                column++;
            }
            
            tokens.push({ type: TokenType.NUMBER, value: num, line, column: startColumn });
            continue;
        }
        
        // Identifiers and keywords
        if (/[a-zA-Z_]/.test(char)) {
            const startColumn = column;
            let ident = '';
            
            while (pos < source.length && /[a-zA-Z0-9_]/.test(source[pos])) {
                ident += source[pos];
                pos++;
                column++;
            }
            
            const tokenType = KEYWORDS[ident] || TokenType.IDENT;
            tokens.push({ type: tokenType, value: ident, line, column: startColumn });
            continue;
        }
        
        // Two-character operators
        if (char === '=' && source[pos + 1] === '>') {
            tokens.push({ type: TokenType.FAT_ARROW, value: '=>', line, column });
            pos += 2;
            column += 2;
            continue;
        }
        
        if (char === '>' && source[pos + 1] === '=') {
            tokens.push({ type: TokenType.GTE, value: '>=', line, column });
            pos += 2;
            column += 2;
            continue;
        }
        
        if (char === '<' && source[pos + 1] === '=') {
            tokens.push({ type: TokenType.LTE, value: '<=', line, column });
            pos += 2;
            column += 2;
            continue;
        }
        
        if (char === '=' && source[pos + 1] === '=') {
            tokens.push({ type: TokenType.EQ, value: '==', line, column });
            pos += 2;
            column += 2;
            continue;
        }
        
        if (char === '!' && source[pos + 1] === '=') {
            tokens.push({ type: TokenType.NEQ, value: '!=', line, column });
            pos += 2;
            column += 2;
            continue;
        }
        
        if (char === '~' && source[pos + 1] === '~') {
            tokens.push({ type: TokenType.TILDE_TILDE, value: '~~', line, column });
            pos += 2;
            column += 2;
            continue;
        }
        
        // Single-character operators and symbols
        const singleCharTokens: Record<string, TokenType> = {
            '?': TokenType.QUESTION,
            '<': TokenType.LT,
            '>': TokenType.GT,
            '=': TokenType.EQUALS,
            '(': TokenType.LPAREN,
            ')': TokenType.RPAREN,
            '[': TokenType.LBRACKET,
            ']': TokenType.RBRACKET,
            ',': TokenType.COMMA,
            '^': TokenType.CARET,
            '@': TokenType.AT,
            '+': TokenType.PLUS,
            '-': TokenType.MINUS,
            '*': TokenType.STAR,
            '/': TokenType.SLASH
        };
        
        if (singleCharTokens[char]) {
            tokens.push({ type: singleCharTokens[char], value: char, line, column });
            pos++;
            column++;
            continue;
        }
        
        // Arrow symbol (→)
        if (char === '→') {
            tokens.push({ type: TokenType.ARROW, value: '→', line, column });
            pos++;
            column++;
            continue;
        }
        
        // Skip whitespace
        if (/\s/.test(char)) {
            pos++;
            column++;
            continue;
        }
        
        // Unknown character - skip with warning
        console.warn(`Unknown character '${char}' at line ${line}, column ${column}`);
        pos++;
        column++;
    }
    
    // Close all indents at end
    while (indentStack.length > 1) {
        indentStack.pop();
        tokens.push({ type: TokenType.DEDENT, value: '', line, column });
    }
    
    tokens.push({ type: TokenType.EOF, value: '', line, column });
    
    return tokens;
}
