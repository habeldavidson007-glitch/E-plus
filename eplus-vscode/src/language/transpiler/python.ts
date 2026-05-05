// Python Transpiler for E+ Language

import * as AST from '../ast';

export function transpileToPython(ast: AST.Program): string {
    const lines: string[] = [];
    
    // Add header comment
    lines.push('# Generated from E+ source');
    lines.push('');
    
    for (const stmt of ast.statements) {
        const result = transpileStatement(stmt, 0);
        if (result) {
            lines.push(result);
        }
    }
    
    return lines.join('\n');
}

function transpileStatement(stmt: AST.Statement, indent: number): string {
    const ind = '    '.repeat(indent);
    
    switch (stmt.type) {
        case 'Assignment':
            return `${ind}${stmt.name} = ${stmt.expression}`;
        
        case 'Input':
            return `${ind}${stmt.name} = input(${JSON.stringify(stmt.prompt)})`;
        
        case 'Output':
            return `${ind}print(${stmt.expression})`;
        
        case 'Condition':
            const conditionLines: string[] = [];
            conditionLines.push(`${ind}if ${stmt.condition}:`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    conditionLines.push(result);
                }
            }
            
            return conditionLines.join('\n');
        
        case 'Else':
            const elseLines: string[] = [];
            elseLines.push(`${ind}else:`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    elseLines.push(result);
                }
            }
            
            return elseLines.join('\n');
        
        case 'Repeat':
            const repeatLines: string[] = [];
            if (stmt.iterable) {
                repeatLines.push(`${ind}for ${stmt.variable} in ${stmt.iterable}:`);
            } else {
                // Simple repeat without iterable - needs a range or iterator
                repeatLines.push(`${ind}for ${stmt.variable} in items:`);
            }
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    repeatLines.push(result);
                }
            }
            
            return repeatLines.join('\n');
        
        case 'FunctionDef':
            const funcLines: string[] = [];
            const params = stmt.parameters.join(', ');
            funcLines.push(`${ind}def ${stmt.name}(${params}):`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    funcLines.push(result);
                }
            }
            
            return funcLines.join('\n');
        
        case 'FunctionCall':
            const args = stmt.arguments.join(', ');
            return `${ind}${stmt.name}(${args})`;
        
        case 'Return':
            return `${ind}return ${stmt.expression}`;
        
        case 'Remove':
            return `${ind}del ${stmt.name}`;
        
        case 'Comment':
            return `${ind}# ${stmt.text}`;
        
        default:
            return '';
    }
}

// Re-export for consistent API
export { transpileToPython as default };
