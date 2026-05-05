#!/usr/bin/env python3
"""
Generate visualization charts for E+ experiment results.

Creates:
- Per-participant bar charts (Python vs E+ CES)
- ΔCES distribution plot
- Tradeoff chart (Effort vs Quality)

Usage: python visualize_results.py results/experiment_ces_analysis.json
"""

import json
import sys
from typing import Dict, List, Any

try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False
    print("Warning: matplotlib not installed. Install with: pip install matplotlib")


def load_data(input_file: str) -> Dict[str, Any]:
    """Load CES analysis JSON file."""
    with open(input_file, 'r') as f:
        return json.load(f)


def create_participant_bars(comparisons: List[Dict[str, Any]], output_file: str):
    """Create bar chart comparing Python vs E+ CES for each participant."""
    if not HAS_MATPLOTLIB:
        print("Skipping participant bars (matplotlib not available)")
        return
    
    # Group by participant
    participants = {}
    for c in comparisons:
        pid = c['participant_id']
        if pid not in participants:
            participants[pid] = {'python': [], 'eplus': []}
        participants[pid]['python'].append(c['ces_python'])
        participants[pid]['eplus'].append(c['ces_eplus'])
    
    # Average per participant
    pids = sorted(participants.keys())
    python_avg = [sum(participants[p]['python'])/len(participants[p]['python']) for p in pids]
    eplus_avg = [sum(participants[p]['eplus'])/len(participants[p]['eplus']) for p in pids]
    
    x = range(len(pids))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(12, 6))
    
    bars1 = ax.bar([i - width/2 for i in x], python_avg, width, label='Python', color='#3498db')
    bars2 = ax.bar([i + width/2 for i in x], eplus_avg, width, label='E+', color='#2ecc71')
    
    ax.set_xlabel('Participant ID', fontsize=12)
    ax.set_ylabel('Cognitive Efficiency Score (CES)', fontsize=12)
    ax.set_title('Cognitive Efficiency: Python vs E+ by Participant', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels([f'P{p}' for p in pids])
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    
    # Add value labels
    for bar in bars1 + bars2:
        height = bar.get_height()
        ax.annotate(f'{height:.1f}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)
    
    plt.tight_layout()
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"✓ Created: {output_file}")


def create_delta_distribution(comparisons: List[Dict[str, Any]], output_file: str):
    """Create distribution plot of ΔCES values."""
    if not HAS_MATPLOTLIB:
        print("Skipping delta distribution (matplotlib not available)")
        return
    
    deltas = [c['delta_ces'] for c in comparisons]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Create histogram
    bins = [-20, -15, -10, -5, -3, 0, 3, 5, 10, 15, 20]
    ax.hist(deltas, bins=bins, edgecolor='black', alpha=0.7, color='#9b59b6')
    
    # Add vertical lines for thresholds
    ax.axvline(x=0, color='gray', linestyle='--', linewidth=1, alpha=0.7)
    ax.axvline(x=3, color='green', linestyle='-', linewidth=2, alpha=0.7, label='Moderate improvement')
    ax.axvline(x=10, color='darkgreen', linestyle='-', linewidth=2, alpha=0.7, label='Strong improvement')
    ax.axvline(x=-3, color='red', linestyle='-', linewidth=2, alpha=0.7, label='Worse performance')
    
    ax.set_xlabel('ΔCES (E+ minus Python)', fontsize=12)
    ax.set_ylabel('Number of Comparisons', fontsize=12)
    ax.set_title('Distribution of Cognitive Efficiency Improvement', fontsize=14, fontweight='bold')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    
    # Add mean line
    mean_delta = sum(deltas) / len(deltas)
    ax.axvline(x=mean_delta, color='orange', linestyle='-.', linewidth=2, 
               label=f'Mean ΔCES = {mean_delta:+.2f}')
    ax.legend()
    
    plt.tight_layout()
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"✓ Created: {output_file}")


def create_tradeoff_chart(results: List[Dict[str, Any]], output_file: str):
    """Create scatter plot of Effort vs Quality."""
    if not HAS_MATPLOTLIB:
        print("Skipping tradeoff chart (matplotlib not available)")
        return
    
    # Separate by mode
    python_points = [(r['effort'], r['quality']) for r in results if r['mode'] == 'python']
    eplus_points = [(r['effort'], r['quality']) for r in results if r['mode'] == 'eplus']
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    if python_points:
        py_effort, py_quality = zip(*python_points)
        ax.scatter(py_effort, py_quality, c='#3498db', s=100, alpha=0.6, 
                   label='Python', marker='o', edgecolors='black')
    
    if eplus_points:
        ep_effort, ep_quality = zip(*eplus_points)
        ax.scatter(ep_effort, ep_quality, c='#2ecc71', s=100, alpha=0.6, 
                   label='E+', marker='s', edgecolors='black')
    
    # Add ideal region annotation (upper-left = better quality, lower effort)
    ax.annotate('Ideal Region\n(Better Quality,\nLower Effort)', 
                xy=(0.1, 0.9), xycoords='axes fraction',
                fontsize=10, ha='left', va='top',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    ax.set_xlabel('Effort Score (lower is better)', fontsize=12)
    ax.set_ylabel('Quality Score (higher is better)', fontsize=12)
    ax.set_title('Effort vs Quality Tradeoff: Python vs E+', fontsize=14, fontweight='bold')
    ax.legend()
    ax.grid(alpha=0.3)
    ax.invert_xaxis()  # Lower effort is better, so invert x-axis
    
    plt.tight_layout()
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"✓ Created: {output_file}")


def create_summary_table(comparisons: List[Dict[str, Any]], output_file: str):
    """Create a text-based summary table."""
    if not comparisons:
        return
    
    deltas = [c['delta_ces'] for c in comparisons]
    mean_delta = sum(deltas) / len(deltas)
    
    strong = sum(1 for c in comparisons if c['strong_improvement'])
    moderate = sum(1 for c in comparisons if c['moderate_improvement'])
    no_diff = sum(1 for c in comparisons if c['no_difference'])
    worse = sum(1 for c in comparisons if c['worse'])
    
    total = len(comparisons)
    
    with open(output_file, 'w') as f:
        f.write("="*70 + "\n")
        f.write("E+ COGNITIVE LOAD EXPERIMENT - SUMMARY TABLE\n")
        f.write("="*70 + "\n\n")
        
        f.write(f"Total Comparisons: {total}\n\n")
        
        f.write("ΔCES Statistics:\n")
        f.write(f"  Mean ΔCES:   {mean_delta:+.2f}\n")
        f.write(f"  Min ΔCES:    {min(deltas):+.2f}\n")
        f.write(f"  Max ΔCES:    {max(deltas):+.2f}\n\n")
        
        f.write("Improvement Breakdown:\n")
        f.write(f"  Strong improvement (ΔCES > +10):     {strong:3d} ({strong/total*100:5.1f}%)\n")
        f.write(f"  Moderate improvement (+3 to +10):    {moderate:3d} ({moderate/total*100:5.1f}%)\n")
        f.write(f"  No difference (-3 to +3):            {no_diff:3d} ({no_diff/total*100:5.1f}%)\n")
        f.write(f"  Worse performance (ΔCES < -3):       {worse:3d} ({worse/total*100:5.1f}%)\n\n")
        
        f.write("Validation Assessment:\n")
        if mean_delta >= 8:
            f.write("  ✅ STRONG VALIDATION: E+ significantly improves cognitive efficiency\n")
        elif mean_delta >= 3:
            f.write("  ⚠️  WEAK VALIDATION: E+ shows promise but needs refinement\n")
        elif mean_delta >= 0:
            f.write("  ⚠️  MIXED RESULTS: Some benefit, not statistically significant\n")
        else:
            f.write("  ❌ FAILURE: E+ does not improve cognitive efficiency\n")
        
        f.write("\n" + "="*70 + "\n")
    
    print(f"✓ Created: {output_file}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python visualize_results.py <ces_analysis_file.json>")
        print("Example: python visualize_results.py results/experiment_ces_analysis.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        data = load_data(input_file)
        
        comparisons = data.get('comparisons', [])
        results = data.get('individual_scores', [])
        
        # Determine output directory
        output_dir = '/'.join(input_file.split('/')[:-1]) or '.'
        
        # Generate all visualizations
        create_participant_bars(
            comparisons, 
            f"{output_dir}/participant_comparison.png"
        )
        
        create_delta_distribution(
            comparisons,
            f"{output_dir}/delta_distribution.png"
        )
        
        create_tradeoff_chart(
            results,
            f"{output_dir}/effort_quality_tradeoff.png"
        )
        
        create_summary_table(
            comparisons,
            f"{output_dir}/summary_table.txt"
        )
        
        print("\n✓ All visualizations generated successfully!")
        print(f"Output directory: {output_dir}/")
        
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{input_file}': {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
