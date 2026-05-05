#!/usr/bin/env python3
"""
Validator Friction Simulator
Predicts where different developer personas will experience friction with E+ validator.
"""

from dataclasses import dataclass
from typing import List, Dict

@dataclass
class FrictionPoint:
    line_number: int
    code: str
    validator_warning: str
    persona_reaction: Dict[str, str]  # junior, intermediate, senior
    friction_level: int  # 1-5

class ValidatorFrictionSimulator:
    def __init__(self):
        self.personas = ['junior', 'intermediate', 'senior']
    
    def simulate(self, eplus_code: str) -> List[FrictionPoint]:
        """Simulate validator friction for given E+ code"""
        lines = eplus_code.strip().split('\n')
        friction_points = []
        
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            
            # Check for dense expressions
            if self._count_operators(stripped) > 2:
                friction_points.append(FrictionPoint(
                    line_number=i,
                    code=stripped,
                    validator_warning="Expression too dense (>2 operators)",
                    persona_reaction={
                        'junior': "Helpful - I didn't realize this was complex",
                        'intermediate': "Slightly annoying but understandable",
                        'senior': "Frustrating - this is obvious to me"
                    },
                    friction_level=3
                ))
            
            # Check for nested conditions
            nesting = stripped.count('? (')
            if nesting >= 2:
                friction_points.append(FrictionPoint(
                    line_number=i,
                    code=stripped,
                    validator_warning="Nesting depth exceeds recommended limit",
                    persona_reaction={
                        'junior': "Confusing - need to simplify",
                        'intermediate': "Warning noted",
                        'senior': "Unnecessary restriction"
                    },
                    friction_level=4
                ))
            
            # Check for list append pattern
            if 'result = result + [' in stripped:
                friction_points.append(FrictionPoint(
                    line_number=i,
                    code=stripped,
                    validator_warning="Consider using dedicated append operation",
                    persona_reaction={
                        'junior': "OK - will learn the pattern",
                        'intermediate': "Why not just .append()?",
                        'senior': "Inefficient - forces extra allocation"
                    },
                    friction_level=5
                ))
        
        return friction_points
    
    def _count_operators(self, line: str) -> int:
        ops = ['+', '-', '*', '/', '%', '==', '!=', '<', '>', '<=', '>=', 'and', 'or']
        count = 0
        for op in ops:
            count += line.count(op)
        return count
    
    def generate_report(self, friction_points: List[FrictionPoint]) -> str:
        """Generate human-readable friction report"""
        report = ["# Validator Friction Analysis\n"]
        
        if not friction_points:
            report.append("✅ No significant friction points detected")
            return '\n'.join(report)
        
        report.append(f"Total friction points: {len(friction_points)}\n")
        
        # Group by friction level
        high_friction = [fp for fp in friction_points if fp.friction_level >= 4]
        
        if high_friction:
            report.append("## 🔴 High Friction Points (Likely Abandonment Risk)\n")
            for fp in high_friction:
                report.append(f"Line {fp.line_number}: `{fp.code}`")
                report.append(f"  Warning: {fp.validator_warning}")
                report.append(f"  Senior reaction: {fp.persona_reaction['senior']}")
                report.append(f"  Friction Level: {fp.friction_level}/5\n")
        
        report.append("## 📊 Persona Impact Summary\n")
        report.append("- Juniors: Generally accepting of validator guidance")
        report.append("- Intermediates: Mixed reactions, question some restrictions")
        report.append("- Seniors: High frustration with forced decomposition")
        
        return '\n'.join(report)


def simulate_validator_friction(eplus_code: str) -> str:
    """Main entry point"""
    simulator = ValidatorFrictionSimulator()
    friction_points = simulator.simulate(eplus_code)
    return simulator.generate_report(friction_points)


if __name__ == "__main__":
    test_code = '''
tasks = []
score = cpu + ram * 2 - users / 2
? (cpu > 80 and ram > 70) →
    ? (score > 200) →
        tasks = tasks + ["urgent"]
'''
    print(simulate_validator_friction(test_code))
