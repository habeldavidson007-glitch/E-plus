"""
CES Analysis Model - Upgraded with Split Layers
Computes Cognitive Efficiency Score with separate objective and subjective metrics
"""

import json
from typing import Dict, List, Any
from dataclasses import dataclass


@dataclass
class ObjectiveEfficiency:
    """Pure performance metrics (no subjective bias)"""
    quality: float  # 0-100
    time_seconds: float
    correctness: float  # 0-100
    
    def compute(self) -> float:
        """OE = Quality / Time (normalized)"""
        # Normalize time to 0-100 scale (lower time = higher score)
        # Assuming max reasonable time is 1200s (20 min)
        time_score = max(0, 100 - (self.time_seconds / 1200 * 100))
        return (self.quality * 0.6 + self.correctness * 0.4) * (time_score / 100)


@dataclass
class CognitiveExperience:
    """Subjective experience metrics"""
    mental_load: float  # 1-10 (lower is better)
    clarity: float  # 1-10 (higher is better)
    confidence: float  # 1-10 (higher is better)
    frustration: float  # 1-10 (lower is better)
    
    def compute(self) -> float:
        """CE = average of normalized subjective metrics"""
        # Normalize all to 0-100 scale
        mental_load_score = (10 - self.mental_load) / 10 * 100
        clarity_score = self.clarity / 10 * 100
        confidence_score = self.confidence / 10 * 100
        frustration_score = (10 - self.frustration) / 10 * 100
        
        return (mental_load_score + clarity_score + confidence_score + frustration_score) / 4


@dataclass
class StructuralSimplicity:
    """Validator-based structural metrics"""
    validator_score: float  # 0-100
    nesting_depth: int
    warning_count: int
    operator_density: float
    
    def compute(self) -> float:
        """SS = validator score adjusted for structural issues"""
        # Penalties for structural complexity
        nesting_penalty = max(0, (self.nesting_depth - 3) * 5)  # Penalty if > 3
        warning_penalty = self.warning_count * 3
        density_penalty = max(0, (self.operator_density - 2) * 10)  # Penalty if > 2
        
        adjusted_score = self.validator_score - nesting_penalty - warning_penalty - density_penalty
        return max(0, min(100, adjusted_score))


@dataclass
class BehavioralFriction:
    """Behavioral metrics indicating cognitive friction"""
    rewrite_count: int
    pause_count: int  # Number of pauses > 5 seconds
    total_pause_time: float  # Total hesitation time in seconds
    error_rate: float  # 0-100
    
    def compute(self) -> float:
        """BF = inverse of friction (higher = less friction)"""
        # Normalize each metric (lower is better)
        rewrite_score = max(0, 100 - self.rewrite_count * 10)
        pause_score = max(0, 100 - self.pause_count * 8)
        hesitation_score = max(0, 100 - (self.total_pause_time / 60 * 100))  # Normalize to 1 min
        error_score = 100 - self.error_rate
        
        return (rewrite_score + pause_score + hesitation_score + error_score) / 4


class CESAnalyzer:
    """Upgraded CES computation with split layers"""
    
    def __init__(self):
        self.results = []
    
    def add_participant_data(
        self,
        participant_id: int,
        mode: str,  # 'python' or 'eplus'
        task_id: int,
        time_seconds: float,
        correctness: float,
        validator_score: float,
        nesting_depth: int,
        warning_count: int,
        operator_density: float,
        mental_load: float,
        clarity: float,
        confidence: float,
        frustration: float,
        rewrites: int,
        pause_count: int = 0,
        total_pause_time: float = 0.0,
        error_rate: float = 0.0
    ):
        """Add complete participant data"""
        data = {
            'participant_id': participant_id,
            'mode': mode,
            'task_id': task_id,
            'objective': ObjectiveEfficiency(
                quality=(validator_score if mode == 'eplus' else correctness),
                time_seconds=time_seconds,
                correctness=correctness
            ),
            'experience': CognitiveExperience(
                mental_load=mental_load,
                clarity=clarity,
                confidence=confidence,
                frustration=frustration
            ),
            'structural': StructuralSimplicity(
                validator_score=validator_score,
                nesting_depth=nesting_depth,
                warning_count=warning_count,
                operator_density=operator_density
            ),
            'behavioral': BehavioralFriction(
                rewrite_count=rewrites,
                pause_count=pause_count,
                total_pause_time=total_pause_time,
                error_rate=error_rate
            )
        }
        self.results.append(data)
    
    def compute_ces(self, data: Dict) -> Dict[str, float]:
        """Compute all CES components separately"""
        obj_eff = data['objective'].compute()
        cog_exp = data['experience'].compute()
        struct_simp = data['structural'].compute()
        behav_fric = data['behavioral'].compute()
        
        # Composite CES (weighted combination)
        composite_ces = (obj_eff * 0.35 + cog_exp * 0.30 + struct_simp * 0.20 + behav_fric * 0.15)
        
        return {
            'objective_efficiency': obj_eff,
            'cognitive_experience': cog_exp,
            'structural_simplicity': struct_simp,
            'behavioral_friction': behav_fric,
            'composite_ces': composite_ces
        }
    
    def analyze_delta(self, participant_id: int) -> Dict[str, float]:
        """Compute ΔCES for a participant (E+ minus Python)"""
        eplus_scores = None
        python_scores = None
        
        for data in self.results:
            if data['participant_id'] == participant_id:
                scores = self.compute_ces(data)
                if data['mode'] == 'eplus':
                    eplus_scores = scores
                elif data['mode'] == 'python':
                    python_scores = scores
        
        if not eplus_scores or not python_scores:
            return {}
        
        delta = {
            'delta_objective': eplus_scores['objective_efficiency'] - python_scores['objective_efficiency'],
            'delta_experience': eplus_scores['cognitive_experience'] - python_scores['cognitive_experience'],
            'delta_structural': eplus_scores['structural_simplicity'] - python_scores.get('structural_simplicity', 0),
            'delta_behavioral': eplus_scores['behavioral_friction'] - python_scores.get('behavioral_friction', 0),
            'delta_composite': eplus_scores['composite_ces'] - python_scores['composite_ces']
        }
        
        return delta
    
    def aggregate_analysis(self) -> Dict[str, Any]:
        """Compute aggregate statistics across all participants"""
        # Group by participant
        participants = set(d['participant_id'] for d in self.results)
        
        deltas = []
        for pid in participants:
            delta = self.analyze_delta(pid)
            if delta:
                deltas.append(delta)
        
        if not deltas:
            return {'error': 'No complete participant pairs found'}
        
        # Compute means for each component
        metrics = ['delta_objective', 'delta_experience', 'delta_structural', 'delta_behavioral', 'delta_composite']
        summary = {}
        
        for metric in metrics:
            values = [d[metric] for d in deltas]
            summary[metric] = {
                'mean': sum(values) / len(values),
                'median': sorted(values)[len(values) // 2],
                'min': min(values),
                'max': max(values),
                'improvement_rate': sum(1 for v in values if v > 0) / len(values) * 100,
                'strong_improvement_rate': sum(1 for v in values if v > 10) / len(values) * 100
            }
        
        summary['participant_count'] = len(deltas)
        summary['individual_deltas'] = deltas
        
        return summary
    
    def export_results(self, filepath: str):
        """Export analysis results to JSON"""
        summary = self.aggregate_analysis()
        
        # Convert dataclasses to dicts for serialization
        export_data = {
            'summary': summary,
            'raw_results': []
        }
        
        for result in self.results:
            raw = {
                'participant_id': result['participant_id'],
                'mode': result['mode'],
                'task_id': result['task_id'],
                'scores': self.compute_ces(result)
            }
            export_data['raw_results'].append(raw)
        
        with open(filepath, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        print(f"Results exported to {filepath}")
        return export_data


def load_experiment_data(filepath: str) -> CESAnalyzer:
    """Load experiment data from JSON and create analyzer"""
    analyzer = CESAnalyzer()
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    for record in data.get('participants', []):
        analyzer.add_participant_data(**record)
    
    return analyzer


if __name__ == '__main__':
    # Example usage with sample data
    analyzer = CESAnalyzer()
    
    # Participant 1 - Python
    analyzer.add_participant_data(
        participant_id=1,
        mode='python',
        task_id=1,
        time_seconds=420,
        correctness=90,
        validator_score=0,  # Not applicable for Python
        nesting_depth=4,
        warning_count=0,
        operator_density=4,
        mental_load=7,
        clarity=7,
        confidence=7,
        frustration=6,
        rewrites=2,
        pause_count=3,
        total_pause_time=15.0,
        error_rate=10
    )
    
    # Participant 1 - E+
    analyzer.add_participant_data(
        participant_id=1,
        mode='eplus',
        task_id=1,
        time_seconds=510,
        correctness=95,
        validator_score=92,
        nesting_depth=2,
        warning_count=1,
        operator_density=1.5,
        mental_load=5,
        clarity=8,
        confidence=8,
        frustration=4,
        rewrites=3,
        pause_count=5,
        total_pause_time=25.0,
        error_rate=5
    )
    
    # Analyze
    summary = analyzer.aggregate_analysis()
    print("\n=== CES Analysis Summary ===")
    print(f"Participants: {summary['participant_count']}")
    print(f"\nΔ Composite CES: {summary['delta_composite']['mean']:.2f}")
    print(f"Improvement Rate: {summary['delta_composite']['improvement_rate']:.1f}%")
    print(f"Strong Improvement (>10): {summary['delta_composite']['strong_improvement_rate']:.1f}%")
    
    print("\n=== Component Breakdown ===")
    print(f"Δ Objective Efficiency: {summary['delta_objective']['mean']:.2f}")
    print(f"Δ Cognitive Experience: {summary['delta_experience']['mean']:.2f}")
    print(f"Δ Structural Simplicity: {summary['delta_structural']['mean']:.2f}")
    print(f"Δ Behavioral Friction: {summary['delta_behavioral']['mean']:.2f}")
    
    # Export
    analyzer.export_results('/workspace/tests/experiment_data_ces_upgraded.json')
