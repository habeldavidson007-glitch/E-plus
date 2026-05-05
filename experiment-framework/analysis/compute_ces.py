#!/usr/bin/env python3
"""
Compute Cognitive Efficiency Score (CES) for experiment participants.

CES = (Quality / Effort) × Clarity

Usage: python compute_ces.py results/experiment_data.json
"""

import json
import sys
from typing import Dict, List, Any


def normalize(value: float, min_val: float, max_val: float) -> float:
    """Min-max normalization to 0-100 scale."""
    if max_val == min_val:
        return 50.0  # Default to middle if no range
    return ((value - min_val) / (max_val - min_val)) * 100


def compute_structure_score(warnings: int, max_nesting: int, max_operators: int) -> float:
    """
    Compute structure score from validator metrics.
    Base 100, subtract penalties.
    """
    penalty = 0
    penalty += warnings * 5  # 5 points per warning
    
    if max_nesting > 3:
        penalty += (max_nesting - 3) * 10  # 10 points per level over 3
    
    if max_operators > 3:
        penalty += (max_operators - 3) * 5  # 5 points per operator over 3
    
    return max(0, 100 - penalty)


def compute_quality(correctness: float, structure_score: float) -> float:
    """
    Quality = (Correctness × 0.6) + (Structure Score × 0.4)
    """
    return (correctness * 0.6) + (structure_score * 0.4)


def compute_effort(time_norm: float, mental_load_norm: float, rewrites_norm: float) -> float:
    """
    Effort = (Time_norm × 0.4) + (Mental_load_norm × 0.4) + (Rewrites_norm × 0.2)
    Lower is better, but we return as-is for CES formula.
    """
    return (time_norm * 0.4) + (mental_load_norm * 0.4) + (rewrites_norm * 0.2)


def compute_clarity(confidence: float, clarity_rating: float) -> float:
    """
    Clarity = (Confidence + Clarity_rating) / 2
    Both are 1-10, scale to 0-100
    """
    avg = (confidence + clarity_rating) / 2
    return avg * 10  # Scale 1-10 to 0-100


def compute_ces(record: Dict[str, Any], 
                time_min: float, time_max: float,
                rewrite_min: float, rewrite_max: float) -> Dict[str, float]:
    """
    Compute all scores for a single record.
    Returns dict with all intermediate and final scores.
    """
    # Extract raw values
    correctness = record.get('correctness_percent', 0)
    warnings = record.get('validator_warnings', 0)
    max_nesting = record.get('max_nesting_depth', 1)
    max_operators = record.get('max_operators_per_line', 1)
    
    time_seconds = record.get('time_seconds', 0)
    mental_load = record.get('mental_load_rating', 5)
    rewrites = record.get('rewrite_count', 0)
    
    confidence = record.get('confidence_rating', 5)
    clarity_rating = record.get('clarity_rating', 5)
    
    # Compute structure score
    structure_score = compute_structure_score(warnings, max_nesting, max_operators)
    
    # Compute quality
    quality = compute_quality(correctness, structure_score)
    
    # Normalize effort components
    time_norm = normalize(time_seconds, time_min, time_max)
    rewrites_norm = normalize(rewrites, rewrite_min, rewrite_max)
    mental_load_norm = normalize(mental_load, 1, 10)  # Already 1-10 scale
    
    # Compute effort
    effort = compute_effort(time_norm, mental_load_norm, rewrites_norm)
    
    # Compute clarity
    clarity = compute_clarity(confidence, clarity_rating)
    
    # Compute final CES
    # Avoid division by zero
    if effort < 1:
        effort = 1
    
    ces = (quality / effort) * clarity
    
    return {
        'participant_id': record.get('participant_id'),
        'mode': record.get('mode'),
        'task_id': record.get('task_id'),
        'structure_score': round(structure_score, 2),
        'quality': round(quality, 2),
        'effort': round(effort, 2),
        'clarity': round(clarity, 2),
        'ces': round(ces, 2),
        'delta_ces': None  # Will be computed in comparison
    }


def load_and_compute(input_file: str) -> List[Dict[str, float]]:
    """Load JSON data and compute CES for all records."""
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Handle both single record and list of records
    if isinstance(data, dict):
        records = [data]
    else:
        records = data
    
    # Find min/max for normalization across dataset
    times = [r.get('time_seconds', 0) for r in records]
    rewrites = [r.get('rewrite_count', 0) for r in records]
    
    time_min, time_max = min(times), max(times)
    rewrite_min, rewrite_max = min(rewrites), max(rewrites)
    
    # Compute CES for each record
    results = []
    for record in records:
        result = compute_ces(record, time_min, time_max, rewrite_min, rewrite_max)
        results.append(result)
    
    return results


def compare_modes(results: List[Dict[str, float]]) -> List[Dict[str, Any]]:
    """
    Compare E+ vs Python for each participant/task pair.
    Computes ΔCES = CES_E+ - CES_Python
    """
    # Group by participant and task
    grouped = {}
    for r in results:
        key = (r['participant_id'], r['task_id'])
        if key not in grouped:
            grouped[key] = {}
        grouped[key][r['mode']] = r
    
    # Compute deltas
    comparisons = []
    for (pid, tid), modes in grouped.items():
        if 'eplus' in modes and 'python' in modes:
            eplus_ces = modes['eplus']['ces']
            python_ces = modes['python']['ces']
            delta = eplus_ces - python_ces
            
            # Update records with delta
            modes['eplus']['delta_ces'] = round(delta, 2)
            modes['python']['delta_ces'] = 0  # Baseline
            
            comparisons.append({
                'participant_id': pid,
                'task_id': tid,
                'ces_python': round(python_ces, 2),
                'ces_eplus': round(eplus_ces, 2),
                'delta_ces': round(delta, 2),
                'improvement': delta > 0,
                'strong_improvement': delta > 10,
                'moderate_improvement': 3 < delta <= 10,
                'no_difference': -3 <= delta <= 3,
                'worse': delta < -3
            })
    
    return comparisons


def print_summary(comparisons: List[Dict[str, Any]]) -> None:
    """Print summary statistics."""
    if not comparisons:
        print("No paired comparisons found.")
        return
    
    deltas = [c['delta_ces'] for c in comparisons]
    
    mean_delta = sum(deltas) / len(deltas)
    median_delta = sorted(deltas)[len(deltas) // 2]
    
    strong = sum(1 for c in comparisons if c['strong_improvement'])
    moderate = sum(1 for c in comparisons if c['moderate_improvement'])
    no_diff = sum(1 for c in comparisons if c['no_difference'])
    worse = sum(1 for c in comparisons if c['worse'])
    
    print("\n" + "="*60)
    print("COGNITIVE EFFICIENCY SCORE (CES) ANALYSIS")
    print("="*60)
    print(f"\nTotal comparisons: {len(comparisons)}")
    print(f"\nΔCES Statistics:")
    print(f"  Mean ΔCES:   {mean_delta:+.2f}")
    print(f"  Median ΔCES: {median_delta:+.2f}")
    print(f"\nImprovement Breakdown:")
    print(f"  Strong improvement (ΔCES > +10):     {strong} ({strong/len(comparisons)*100:.1f}%)")
    print(f"  Moderate improvement (+3 to +10):    {moderate} ({moderate/len(comparisons)*100:.1f}%)")
    print(f"  No meaningful difference (-3 to +3): {no_diff} ({no_diff/len(comparisons)*100:.1f}%)")
    print(f"  E+ performed worse (ΔCES < -3):      {worse} ({worse/len(comparisons)*100:.1f}%)")
    print("\nValidation Assessment:")
    
    if mean_delta >= 8:
        print("  ✅ STRONG VALIDATION: E+ significantly improves cognitive efficiency")
    elif mean_delta >= 3:
        print("  ⚠️  WEAK VALIDATION: E+ shows promise but needs refinement")
    elif mean_delta >= 0:
        print("  ⚠️  MIXED RESULTS: Some benefit, not statistically significant")
    else:
        print("  ❌ FAILURE: E+ does not improve cognitive efficiency")
    
    print("="*60 + "\n")


def main():
    if len(sys.argv) < 2:
        print("Usage: python compute_ces.py <results_file.json>")
        print("Example: python compute_ces.py results/experiment_data.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        # Compute CES for all records
        results = load_and_compute(input_file)
        
        # Compare modes
        comparisons = compare_modes(results)
        
        # Print summary
        print_summary(comparisons)
        
        # Save detailed results
        output_file = input_file.replace('.json', '_ces_analysis.json')
        with open(output_file, 'w') as f:
            json.dump({
                'individual_scores': results,
                'comparisons': comparisons
            }, f, indent=2)
        
        print(f"Detailed results saved to: {output_file}")
        
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{input_file}': {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
