// C++ Transpiler for E+ Language

import * as AST from '../ast';

export function transpileToCpp(ast: AST.Program): string {
    const lines: string[] = [];
    
    // Add headers
    lines.push('// Generated from E+ source');
    lines.push('#include <iostream>');
    lines.push('#include <string>');
    lines.push('using namespace std;');
    lines.push('');
    lines.push('int main() {');
    
    for (const stmt of ast.statements) {
        const result = transpileStatement(stmt, 1);
        if (result) {
            lines.push(result);
        }
    }
    
    lines.push('    return 0;');
    lines.push('}');
    
    return lines.join('\n');
}

function inferType(expression: string): string {
    // Simple type inference based on expression content
    if (/^\d+$/.test(expression.trim())) {
        return 'int';
    }
    if (expression.startsWith('"') && expression.endsWith('"')) {
        return 'string';
    }
    if (/true|false/i.test(expression)) {
        return 'bool';
    }
    // Default to auto for complex expressions
    return 'auto';
}

function transpileStatement(stmt: AST.Statement, indent: number): string {
    const ind = '    '.repeat(indent);
    
    switch (stmt.type) {
        case 'Assignment': {
            const type = inferType(stmt.expression);
            return `${ind}${type} ${stmt.name} = ${stmt.expression};`;
        }
        
        case 'Input': {
            const promptLine = `${ind}cout << ${JSON.stringify(stmt.prompt)} << endl;`;
            const inputLine = `${ind}cin >> ${stmt.name};`;
            return `${promptLine}\n${inputLine}`;
        }
        
        case 'Output':
            return `${ind}cout << ${stmt.expression} << endl;`;
        
        case 'Condition': {
            const conditionLines: string[] = [];
            conditionLines.push(`${ind}if (${stmt.condition}) {`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    conditionLines.push(result);
                }
            }
            
            conditionLines.push(`${ind}}`);
            return conditionLines.join('\n');
        }
        
        case 'Else': {
            const elseLines: string[] = [];
            elseLines.push(`${ind}else {`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    elseLines.push(result);
                }
            }
            
            elseLines.push(`${id}}`);
            return elseLines.join('\n');
        }
        
        case 'Repeat': {
            const repeatLines: string[] = [];
            if (stmt.iterable) {
                // For range-based for loop
                repeatLines.push(`${ind}for (auto& ${stmt.variable} : ${stmt.iterable}) {`);
            } else {
                // Default to a simple counter loop
                repeatLines.push(`${ind}for (int ${stmt.variable} = 0; ${stmt.variable} < 10; ${stmt.variable}++) {`);
            }
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    repeatLines.push(result);
                }
            }
            
            repeatLines.push(`${ind}}`);
            return repeatLines.join('\n');
        }
        
        case 'FunctionDef': {
            // Note: Full function support would require hoisting and return type inference
            const params = stmt.parameters.map(p => `auto ${p}`).join(', ');
            const funcLines: string[] = [];
            funcLines.push(`auto ${stmt.name} = [](${params}) {`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    funcLines.push(result);
                }
            }
            
            funcLines.push(`${ind}};`);
            return funcLines.join('\n');
        }
        
        case 'FunctionCall': {
            const args = stmt.arguments.join(', ');
            return `${ind}${stmt.name}(${args});`;
        }
        
        case 'Return':
            return `${ind}return ${stmt.expression};`;
        
        case 'Remove':
            // C++ doesn't have direct equivalent, skip or comment
            return `${ind}// remove ${stmt.name} (not directly supported)`;
        
        case 'Comment':
            return `${ind}// ${stmt.text}`;
        
        default:
            return '';
    }
}

// Re-export for consistent API
export { transpileToCpp as default };
