// GDScript Transpiler for E+ Language

import * as AST from '../ast';

export function transpileToGdscript(ast: AST.Program): string {
    const lines: string[] = [];
    
    // Add header comment
    lines.push('# Generated from E+ source');
    lines.push('extends Node');
    lines.push('');
    
    // Generate functions first (GDScript requires functions to be defined before use in some cases)
    const functions: AST.FunctionDef[] = [];
    const otherStatements: AST.Statement[] = [];
    
    for (const stmt of ast.statements) {
        if (stmt.type === 'FunctionDef') {
            functions.push(stmt);
        } else {
            otherStatements.push(stmt);
        }
    }
    
    // Transpile functions
    for (const func of functions) {
        const result = transpileStatement(func, 0);
        if (result) {
            lines.push(result);
            lines.push('');
        }
    }
    
    // Add _ready function for main execution
    if (otherStatements.length > 0) {
        lines.push('func _ready():');
        
        for (const stmt of otherStatements) {
            const result = transpileStatement(stmt, 1);
            if (result) {
                lines.push(result);
            }
        }
    }
    
    return lines.join('\n');
}

function transpileStatement(stmt: AST.Statement, indent: number): string {
    const ind = '    '.repeat(indent);
    
    switch (stmt.type) {
        case 'Assignment':
            return `${ind}var ${stmt.name} = ${stmt.expression}`;
        
        case 'Input':
            // GDScript doesn't have direct console input, use a placeholder
            return `${ind}var ${stmt.name} = "${stmt.prompt}" # TODO: Replace with actual input`;
        
        case 'Output':
            return `${ind}print(${stmt.expression})`;
        
        case 'Condition': {
            const conditionLines: string[] = [];
            conditionLines.push(`${ind}if ${stmt.condition}:`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    conditionLines.push(result);
                }
            }
            
            return conditionLines.join('\n');
        }
        
        case 'Else': {
            const elseLines: string[] = [];
            elseLines.push(`${ind}else:`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    elseLines.push(result);
                }
            }
            
            return elseLines.join('\n');
        }
        
        case 'Repeat': {
            const repeatLines: string[] = [];
            if (stmt.iterable) {
                repeatLines.push(`${ind}for ${stmt.variable} in ${stmt.iterable}:`);
            } else {
                // Simple repeat without iterable
                repeatLines.push(`${ind}for ${stmt.variable} in range(10):`);
            }
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    repeatLines.push(result);
                }
            }
            
            return repeatLines.join('\n');
        }
        
        case 'FunctionDef': {
            const params = stmt.parameters.join(', ');
            const funcLines: string[] = [];
            funcLines.push(`${ind}func ${stmt.name}(${params}):`);
            
            for (const blockStmt of stmt.block.statements) {
                const result = transpileStatement(blockStmt, indent + 1);
                if (result) {
                    funcLines.push(result);
                }
            }
            
            return funcLines.join('\n');
        }
        
        case 'FunctionCall': {
            const args = stmt.arguments.join(', ');
            return `${ind}${stmt.name}(${args})`;
        }
        
        case 'Return':
            return `${ind}return ${stmt.expression}`;
        
        case 'Remove':
            // GDScript doesn't have direct equivalent
            return `${ind}# remove ${stmt.name} (not directly supported)`;
        
        case 'Comment':
            return `${ind}# ${stmt.text}`;
        
        default:
            return '';
    }
}

// Re-export for consistent API
export { transpileToGdscript as default };
