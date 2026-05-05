// Recursive-Descent Parser for E+ Language

import { Token, TokenType } from './tokenizer';
import * as AST from './ast';

export class ParseError extends Error {
    constructor(message: string, public line?: number, public column?: number) {
        super(message);
        this.name = 'ParseError';
    }
}

export class Parser {
    private tokens: Token[];
    private pos = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private current(): Token {
        return this.tokens[this.pos];
    }

    private peek(offset = 0): Token {
        return this.tokens[this.pos + offset] || this.tokens[this.tokens.length - 1];
    }

    private advance(): Token {
        const token = this.current();
        if (this.current().type !== TokenType.EOF) {
            this.pos++;
        }
        return token;
    }

    private match(...types: TokenType[]): boolean {
        return types.includes(this.current().type);
    }

    private expect(type: TokenType, context?: string): Token {
        if (this.current().type !== type) {
            throw new ParseError(
                `Expected ${type}${context ? ` in ${context}` : ''}, got ${this.current().type}`,
                this.current().line,
                this.current().column
            );
        }
        return this.advance();
    }

    private skipNewlines() {
        while (this.match(TokenType.NEWLINE)) {
            this.advance();
        }
    }

    parse(): AST.Program {
        const statements: AST.Statement[] = [];

        while (!this.match(TokenType.EOF)) {
            this.skipNewlines();

            if (this.match(TokenType.EOF)) {
                break;
            }

            try {
                const stmt = this.parseStatement();
                if (stmt) {
                    statements.push(stmt);
                }
            } catch (error) {
                // Skip to next line on error
                while (!this.match(TokenType.NEWLINE, TokenType.EOF)) {
                    this.advance();
                }
            }
        }

        return AST.createNode<AST.Program>('Program', { statements });
    }

    private parseStatement(): AST.Statement | null {
        const token = this.current();
        const line = token.line;
        const column = token.column;

        // Comment
        if (this.match(TokenType.COMMENT)) {
            const commentToken = this.advance();
            const text = commentToken.value.slice(2).trim(); // Remove ##
            return AST.createNode<AST.Comment>('Comment', { text }, line, column);
        }

        // Input: name = < "prompt"
        if (this.match(TokenType.IDENT)) {
            const nameToken = this.advance();
            
            if (this.match(TokenType.EQUALS)) {
                this.advance(); // consume =
                
                if (this.match(TokenType.LT)) {
                    this.advance(); // consume <
                    const promptToken = this.expect(TokenType.STRING, 'input prompt');
                    const prompt = promptToken.value.slice(1, -1); // Remove quotes
                    return AST.createNode<AST.Input>('Input', { name: nameToken.value, prompt }, line, column);
                } else {
                    // Regular assignment
                    const expr = this.collectExpression();
                    return AST.createNode<AST.Assignment>('Assignment', { 
                        name: nameToken.value, 
                        expression: expr 
                    }, line, column);
                }
            }
        }

        // Output: > expression
        if (this.match(TokenType.GT)) {
            this.advance();
            const expr = this.collectExpression();
            return AST.createNode<AST.Output>('Output', { expression: expr }, line, column);
        }

        // Condition: ? (condition) → block
        if (this.match(TokenType.QUESTION)) {
            this.advance(); // consume ?
            this.expect(TokenType.LPAREN, 'condition');
            const condition = this.collectUntil(TokenType.RPAREN);
            this.advance(); // consume )
            const block = this.parseBlock();
            return AST.createNode<AST.Condition>('Condition', { condition, block }, line, column);
        }

        // Else: else → block
        if (this.match(TokenType.ELSE)) {
            this.advance();
            const block = this.parseBlock();
            return AST.createNode<AST.Else>('Else', { block }, line, column);
        }

        // Repeat: repeat var [in iterable] → block
        if (this.match(TokenType.REPEAT)) {
            this.advance();
            const varToken = this.expect(TokenType.IDENT, 'repeat variable');
            let iterable: string | undefined;

            if (this.match(TokenType.IN)) {
                this.advance();
                iterable = this.collectExpression();
            }

            const block = this.parseBlock();
            return AST.createNode<AST.Repeat>('Repeat', { 
                variable: varToken.value, 
                iterable,
                block 
            }, line, column);
        }

        // Function definition: [name] (params) → block
        if (this.match(TokenType.LBRACKET)) {
            this.advance();
            const nameToken = this.expect(TokenType.IDENT, 'function name');
            this.expect(TokenType.RBRACKET, 'function definition');
            this.expect(TokenType.LPAREN, 'function parameters');
            
            const params = this.parseParameters();
            this.expect(TokenType.RPAREN, 'function parameters');
            
            const block = this.parseBlock();
            return AST.createNode<AST.FunctionDef>('FunctionDef', {
                name: nameToken.value,
                parameters: params,
                block
            }, line, column);
        }

        // Function call: call name(args) or ^name(args)
        if (this.match(TokenType.CALL)) {
            this.advance();
            const nameToken = this.expect(TokenType.IDENT, 'function call');
            this.expect(TokenType.LPAREN, 'function arguments');
            const args = this.parseArguments();
            this.expect(TokenType.RPAREN, 'function arguments');
            return AST.createNode<AST.FunctionCall>('FunctionCall', {
                name: nameToken.value,
                arguments: args,
                useCaret: false
            }, line, column);
        }

        if (this.match(TokenType.CARET)) {
            this.advance();
            const nameToken = this.expect(TokenType.IDENT, 'function call');
            this.expect(TokenType.LPAREN, 'function arguments');
            const args = this.parseArguments();
            this.expect(TokenType.RPAREN, 'function arguments');
            return AST.createNode<AST.FunctionCall>('FunctionCall', {
                name: nameToken.value,
                arguments: args,
                useCaret: true
            }, line, column);
        }

        // Return: return expression or => expression
        if (this.match(TokenType.RETURN)) {
            this.advance();
            const expr = this.collectExpression();
            return AST.createNode<AST.Return>('Return', { expression: expr }, line, column);
        }

        if (this.match(TokenType.ARROW)) {
            // This is actually =>, but we tokenize it as ARROW for return
            // In the grammar, => is an alias for return
            // For now, handle it if it appears at statement start
        }

        // Remove: remove name or ~~name
        if (this.match(TokenType.REMOVE)) {
            this.advance();
            const nameToken = this.expect(TokenType.IDENT, 'remove target');
            return AST.createNode<AST.Remove>('Remove', { name: nameToken.value }, line, column);
        }

        if (this.match(TokenType.TILDE_TILDE)) {
            this.advance();
            const nameToken = this.expect(TokenType.IDENT, 'remove target');
            return AST.createNode<AST.Remove>('Remove', { name: nameToken.value }, line, column);
        }

        // Skip unknown tokens
        this.advance();
        return null;
    }

    private parseBlock(): AST.Block {
        this.expect(TokenType.ARROW, 'block');
        this.expect(TokenType.NEWLINE, 'block');
        
        const indentToken = this.expect(TokenType.INDENT, 'block');
        
        const statements: AST.Statement[] = [];
        
        while (!this.match(TokenType.DEDENT, TokenType.EOF)) {
            this.skipNewlines();
            
            if (this.match(TokenType.DEDENT)) {
                break;
            }
            
            try {
                const stmt = this.parseStatement();
                if (stmt) {
                    statements.push(stmt);
                }
            } catch (error) {
                while (!this.match(TokenType.NEWLINE, TokenType.DEDENT, TokenType.EOF)) {
                    this.advance();
                }
            }
        }
        
        this.expect(TokenType.DEDENT, 'block');
        
        return AST.createNode<AST.Block>('Block', { statements }, indentToken.line, indentToken.column);
    }

    private parseParameters(): string[] {
        const params: string[] = [];
        
        if (!this.match(TokenType.RPAREN)) {
            params.push(this.expect(TokenType.IDENT, 'parameter').value);
            
            while (this.match(TokenType.COMMA)) {
                this.advance();
                params.push(this.expect(TokenType.IDENT, 'parameter').value);
            }
        }
        
        return params;
    }

    private parseArguments(): string[] {
        const args: string[] = [];
        
        if (!this.match(TokenType.RPAREN)) {
            args.push(this.collectExpression());
            
            while (this.match(TokenType.COMMA)) {
                this.advance();
                args.push(this.collectExpression());
            }
        }
        
        return args;
    }

    private collectExpression(): string {
        let expr = '';
        let parenDepth = 0;
        let bracketDepth = 0;
        
        while (!this.match(TokenType.EOF, TokenType.NEWLINE)) {
            const token = this.current();
            
            if (token.type === TokenType.LPAREN) parenDepth++;
            if (token.type === TokenType.RPAREN) parenDepth--;
            if (token.type === TokenType.LBRACKET) bracketDepth++;
            if (token.type === TokenType.RBRACKET) bracketDepth--;
            
            if (parenDepth === 0 && bracketDepth === 0 && 
                (token.type === TokenType.ARROW || token.type === TokenType.NEWLINE)) {
                break;
            }
            
            expr += token.value;
            this.advance();
        }
        
        return expr.trim();
    }

    private collectUntil(stopType: TokenType): string {
        let result = '';
        
        while (!this.match(stopType, TokenType.EOF)) {
            result += this.advance().value;
        }
        
        return result.trim();
    }
}

export function parse(tokens: Token[]): AST.Program {
    const parser = new Parser(tokens);
    return parser.parse();
}
