#!/usr/bin/env python3
"""
Minimal E+ Runner for Testing
E+ → Python → exec
"""

import sys
import re
from pathlib import Path

class Tokenizer:
    def __init__(self, code):
        self.code = code
        self.pos = 0
        self.tokens = []
        self.tokenize()
    
    def tokenize(self):
        lines = self.code.split('\n')
        line_num = 0
        for line in lines:
            line_num += 1
            # Skip comments
            if line.strip().startswith('##'):
                continue
            # Tokenize line (simplified)
            self.tokens.append((line_num, line))
        return self.tokens

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
    
    def parse(self):
        statements = []
        while self.pos < len(self.tokens):
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
        return statements
    
    def parse_statement(self):
        line_num, line = self.tokens[self.pos]
        self.pos += 1
        stripped = line.strip()
        
        if not stripped:
            return None
        
        # Assignment: name = expr
        if '=' in stripped and not stripped.startswith('?') and not stripped.startswith('['):
            parts = stripped.split('=', 1)
            name = parts[0].strip()
            expr = parts[1].strip()
            if expr.startswith('<'):
                # Input
                prompt = expr[1:].strip().strip('"\'')
                return ('input', line_num, name, prompt)
            else:
                return ('assign', line_num, name, expr)
        
        # Output: > expr
        if stripped.startswith('>'):
            expr = stripped[1:].strip()
            return ('output', line_num, expr)
        
        # Condition: ? (cond) →
        if stripped.startswith('?'):
            match = re.match(r'\?\s*\((.+?)\)\s*→', stripped)
            if match:
                cond = match.group(1)
                return ('if', line_num, cond)
        
        # Else
        if stripped.startswith('else'):
            return ('else', line_num)
        
        # Repeat forever
        if stripped.startswith('repeat forever'):
            return ('while_true', line_num)
        
        # Repeat item in list
        if stripped.startswith('repeat') and 'in' in stripped:
            match = re.match(r'repeat\s+(\w+)\s+in\s+(.+?)\s*→', stripped)
            if match:
                var = match.group(1)
                iterable = match.group(2)
                return ('for_loop', line_num, var, iterable)
        
        # Function definition
        if stripped.startswith('['):
            match = re.match(r'\[(\w+)\]\s*\(([^)]*)\)\s*→', stripped)
            if match:
                name = match.group(1)
                params = [p.strip() for p in match.group(2).split(',') if p.strip()]
                return ('func_def', line_num, name, params)
        
        # Function call
        if stripped.startswith('call '):
            match = re.match(r'call\s+(\w+)\(([^)]*)\)', stripped)
            if match:
                name = match.group(1)
                args = [a.strip() for a in match.group(2).split(',') if a.strip()]
                return ('func_call', line_num, name, args)
        
        # Return
        if stripped.startswith('return'):
            expr = stripped[6:].strip()
            return ('return', line_num, expr)
        
        return ('unknown', line_num, stripped)

def transpile_to_python(eplus_code):
    """Transpile E+ to Python"""
    tokenizer = Tokenizer(eplus_code)
    parser = Parser(tokenizer.tokens)
    statements = parser.parse()
    
    python_lines = ['# Generated from E+ source', '']
    indent_stack = [0]
    current_indent = 0
    
    i = 0
    while i < len(statements):
        stmt = statements[i]
        stmt_type = stmt[0]
        line_num = stmt[1]
        
        if stmt_type == 'assign':
            _, _, name, expr = stmt
            python_lines.append(' ' * current_indent + f'{name} = {expr}')
        
        elif stmt_type == 'input':
            _, _, name, prompt = stmt
            python_lines.append(' ' * current_indent + f'{name} = input("{prompt}")')
        
        elif stmt_type == 'output':
            _, _, expr = stmt
            python_lines.append(' ' * current_indent + f'print({expr})')
        
        elif stmt_type == 'if':
            _, _, cond = stmt
            python_lines.append(' ' * current_indent + f'if {cond}:')
            current_indent += 4
            indent_stack.append(current_indent)
        
        elif stmt_type == 'else':
            # Pop the if indent
            if indent_stack:
                indent_stack.pop()
                current_indent = indent_stack[-1] if indent_stack else 0
            python_lines.append(' ' * current_indent + 'else:')
            current_indent += 4
            indent_stack.append(current_indent)
        
        elif stmt_type == 'while_true':
            python_lines.append(' ' * current_indent + 'while True:')
            current_indent += 4
            indent_stack.append(current_indent)
        
        elif stmt_type == 'for_loop':
            _, _, var, iterable = stmt
            python_lines.append(' ' * current_indent + f'for {var} in {iterable}:')
            current_indent += 4
            indent_stack.append(current_indent)
        
        elif stmt_type == 'func_def':
            _, _, name, params = stmt
            param_str = ', '.join(params)
            python_lines.append(' ' * current_indent + f'def {name}({param_str}):')
            current_indent += 4
            indent_stack.append(current_indent)
        
        elif stmt_type == 'func_call':
            _, _, name, args = stmt
            args_str = ', '.join(args)
            python_lines.append(' ' * current_indent + f'{name}({args_str})')
        
        elif stmt_type == 'return':
            _, _, expr = stmt
            python_lines.append(' ' * current_indent + f'return {expr}')
        
        elif stmt_type == 'unknown':
            pass  # Skip unknown
        
        i += 1
        
        # Check if next statement should dedent (simplified logic)
        if i < len(statements):
            next_stmt = statements[i]
            # If current is if/else/while/for/func and next is at same level, we need to dedent
            # This is very simplified - real implementation needs proper block tracking
            pass
    
    return '\n'.join(python_lines)

# Test with task manager
if __name__ == '__main__':
    test_file = '/workspace/test_task_manager.eplus'
    
    with open(test_file, 'r') as f:
        eplus_code = f.read()
    
    print("=== E+ Source ===")
    print(eplus_code)
    print("\n=== Python Output ===")
    python_code = transpile_to_python(eplus_code)
    print(python_code)
