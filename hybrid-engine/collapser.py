#!/usr/bin/env python3
"""
E+ → Python Collapser
Converts explicit E+ logic back into idiomatic, compressed Python.
Target: Production optimization, Senior developers
"""

import re

class EPlusToPythonCollapser:
    def __init__(self):
        self.collapse_level = "balanced"  # balanced, aggressive
    
    def collapse(self, eplus_code: str) -> str:
        """Collapse verbose E+ to compact Python"""
        lines = eplus_code.strip().split('\n')
        python_lines = []
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Detect pattern: var = default \n ? (cond) → \n var = value
            if self._is_ternary_pattern(lines, i):
                collapsed, skip = self._collapse_ternary(lines, i)
                python_lines.append(collapsed)
                i += skip
                continue
            
            # Detect pattern: result = [] \n repeat x in y → ... result = result + [expr]
            if self._is_list_comp_pattern(lines, i):
                collapsed, skip = self._collapse_list_comp(lines, i)
                python_lines.append(collapsed)
                i += skip
                continue
            
            # Regular line
            if line and not line.startswith('#'):
                python_lines.append(self._convert_line(line))
            
            i += 1
        
        return '\n'.join(python_lines)
    
    def _is_ternary_pattern(self, lines: list, idx: int) -> bool:
        if idx + 3 >= len(lines):
            return False
        
        line1 = lines[idx].strip()
        line2 = lines[idx + 1].strip() if idx + 1 < len(lines) else ""
        line3 = lines[idx + 2].strip() if idx + 2 < len(lines) else ""
        line4 = lines[idx + 3].strip() if idx + 3 < len(lines) else ""
        
        # Pattern: var = value_a \n ? (cond) → \n var = value_b
        has_assignment = '=' in line1 and '?' not in line1
        has_condition = line2.startswith('? (') and line2.endswith('→')
        has_reassignment = '=' in line3 and '?' not in line3
        
        return has_assignment and has_condition and has_reassignment
    
    def _collapse_ternary(self, lines: list, idx: int) -> tuple:
        line1 = lines[idx].strip()
        line2 = lines[idx + 1].strip()
        line3 = lines[idx + 2].strip()
        
        # Extract parts
        match1 = re.match(r'(\w+)\s*=\s*(.+)', line1)
        match2 = re.match(r'\?\s*\((.+)\)\s*→', line2)
        match3 = re.match(r'(\w+)\s*=\s*(.+)', line3)
        
        if match1 and match2 and match3:
            var = match1.group(1)
            false_val = match1.group(2)
            condition = match2.group(1)
            true_val = match3.group(2)
            
            collapsed = f"{var} = {true_val} if {condition} else {false_val}"
            return collapsed, 4  # Skip 4 lines
        
        return line1, 1
    
    def _is_list_comp_pattern(self, lines: list, idx: int) -> bool:
        if idx + 5 >= len(lines):
            return False
        
        line1 = lines[idx].strip()
        # Check for: result = []
        is_empty_list = re.match(r'(\w+)\s*=\s*\[\]', line1)
        
        if not is_empty_list:
            return False
        
        # Look for repeat loop and append pattern
        has_repeat = any('repeat' in l and 'in' in l for l in lines[idx:idx+3])
        has_append = any('result = result + [' in l or '.append(' in l for l in lines[idx:idx+8])
        
        return has_repeat and has_append
    
    def _collapse_list_comp(self, lines: list, idx: int) -> tuple:
        # Simplified collapse - in production would need full AST analysis
        line1 = lines[idx].strip()
        match = re.match(r'(\w+)\s*=\s*\[\]', line1)
        
        if match:
            target = match.group(1)
            # Heuristic: create placeholder for list comp
            collapsed = f"# {target} = [expr for item in iterable]  # Collapsed from E+ loop"
            collapsed += f"\n# Review and optimize manually"
            return collapsed, 6
        
        return line1, 1
    
    def _convert_line(self, line: str) -> str:
        line = line.replace('> ', 'print(')
        if line.endswith(')'):
            line += ')'
        return line


def collapse_eplus_to_python(eplus_code: str, level: str = "balanced") -> str:
    """Main entry point"""
    collapser = EPlusToPythonCollapser()
    collapser.collapse_level = level
    return collapser.collapse(eplus_code)


if __name__ == "__main__":
    # Test example
    test_code = '''
tier = "standard"
? (user.balance > 100) →
    tier = "premium"

result = []
repeat user in users →
    temp = user.name
    result = result + [temp]
'''
    print(collapse_eplus_to_python(test_code))
