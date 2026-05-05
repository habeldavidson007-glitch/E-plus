// AST Node Definitions for E+ Language

export type NodeType =
    | 'Program'
    | 'Assignment'
    | 'Input'
    | 'Output'
    | 'Condition'
    | 'Else'
    | 'Repeat'
    | 'FunctionDef'
    | 'FunctionCall'
    | 'Return'
    | 'Remove'
    | 'Block'
    | 'Comment'
    | 'Expression'
    | 'SysCall';

export interface Node {
    type: NodeType;
    line?: number;
    column?: number;
}

export interface Program extends Node {
    type: 'Program';
    statements: Statement[];
}

export interface Assignment extends Node {
    type: 'Assignment';
    name: string;
    expression: string;
}

export interface Input extends Node {
    type: 'Input';
    name: string;
    prompt: string;
}

export interface Output extends Node {
    type: 'Output';
    expression: string;
}

export interface Condition extends Node {
    type: 'Condition';
    condition: string;
    block: Block;
}

export interface Else extends Node {
    type: 'Else';
    block: Block;
}

export interface Repeat extends Node {
    type: 'Repeat';
    variable: string;
    iterable?: string;
    block: Block;
}

export interface FunctionDef extends Node {
    type: 'FunctionDef';
    name: string;
    parameters: string[];
    block: Block;
}

export interface FunctionCall extends Node {
    type: 'FunctionCall';
    name: string;
    arguments: string[];
    useCaret: boolean; // true if ^ syntax was used
}

export interface Return extends Node {
    type: 'Return';
    expression: string;
}

export interface Remove extends Node {
    type: 'Remove';
    name: string;
}

export interface Block extends Node {
    type: 'Block';
    statements: Statement[];
}

export interface Comment extends Node {
    type: 'Comment';
    text: string;
}

export interface Expression extends Node {
    type: 'Expression';
    value: string;
}

export interface SysCall extends Node {
    type: 'SysCall';
    expression: string;
    target?: string;
}

export type Statement =
    | Assignment
    | Input
    | Output
    | Condition
    | Else
    | Repeat
    | FunctionDef
    | FunctionCall
    | Return
    | Remove
    | Comment
    | SysCall;

// Helper function to create nodes with position info
export function createNode<T extends Node>(type: T['type'], props: Partial<T>, line?: number, column?: number): T {
    return {
        type,
        line,
        column,
        ...props
    } as T;
}
