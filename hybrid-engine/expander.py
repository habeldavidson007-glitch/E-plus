#!/usr/bin/env python3
"""
Python → E+ Expander
Converts dense Python constructs into explicit, step-by-step E+ logic.
Target: Debugging, Learning, Junior Developers
"""

import re
import ast

class PythonToEPlusExpander:
    def __init__(self):
        self.indent_level = 0
    
    def expand(self, python_code: str) -> str:
        """Expand dense Python to verbose E+"""
        lines = python_code.strip().split('\n')
        eplus_lines = []
        
        for line in lines:
            stripped = line.strip()
            if not stripped or stripped.startswith('#'):
                continue
            
            # Expand list comprehensions
            if self._is_list_comprehension(stripped):
                eplus_lines.extend(self._expand_list_comp(stripped))
            
            # Expand ternary operators
            elif 'if' in stripped and 'else' in stripped and '=' in stripped:
                eplus_lines.extend(self._expand_ternary(stripped))
            
            # Expand for loops with inline conditions
            elif stripped.startswith('for ') and ' if ' in stripped:
                eplus_lines.extend(self._expand_filtered_loop(stripped))
            
            # Regular assignment or statement
            else:
                eplus_lines.append(self._convert_line(stripped))
        
        return '\n'.join(eplus_lines)
    
    def _is_list_comprehension(self, line: str) -> bool:
        return '=' in line and '[' in line and 'for' in line and 'in' in line
    
    def _expand_list_comp(self, line: str) -> list:
        # Pattern: result = [expr for var in iterable if condition]
        match = re.match(r'(\w+)\s*=\s*\[(.+)\s+for\s+(\w+)\s+in\s+(\w+)(?:\s+if\s+(.+))?\]', line)
        if not match:
            return [line]
        
        target, expr, var, iterable, condition = match.groups()
        
        eplus = [
            f"{target} = []",
            f"",
            f"repeat {var} in {iterable} →"
        ]
        
        if condition:
            eplus.append(f"    ? ({condition}) →")
            eplus.append(f"        temp = {expr}")
            eplus.append(f"        {target} = {target} + [temp]")
        else:
            eplus.append(f"    temp = {expr}")
            eplus.append(f"    {target} = {target} + [temp]")
        
        return eplus
    
    def _expand_ternary(self, line: str) -> list:
        # Pattern: var = true_val if condition else false_val
        match = re.match(r'(\w+)\s*=\s*(.+?)\s+if\s+(.+?)\s+else\s+(.+)', line)
        if not match:
            return [line]
        
        target, true_val, condition, false_val = match.groups()
        
        return [
            f"{target} = {false_val}",
            f"? ({condition}) →",
            f"    {target} = {true_val}"
        ]
    
    def _expand_filtered_loop(self, line: str) -> list:
        # Simple expansion of filtered loops
        return [
            "# Expanded from filtered loop",
            line.replace(" if ", " →\n    # Note: condition moved inside\n    ? (") + ")"
        ]
    
    def _convert_line(self, line: str) -> str:
        # Basic conversions
        line = line.replace('print(', '> ')
        line = line.replace('append(', '= append(')  # Placeholder
        return line


def expand_python_to_eplus(python_code: str) -> str:
    """Main entry point"""
    expander = PythonToEPlusExpander()
    return expander.expand(python_code)


if __name__ == "__main__":
    # Test example
    test_code = '''
result = [(u.name, 'premium' if u.balance > 100 else 'standard') for u in users if u.active]
status = "high" if score > 80 else "low"
'''
    print(expand_python_to_eplus(test_code))
