# E+ Cognitive Load Experiment Framework

This framework provides everything needed to test whether E+ reduces cognitive load in real coding tasks.

## Directory Structure

```
experiment-framework/
├── README.md                    # This file
├── EXPERIMENT_PROTOCOL.md       # Detailed experimental procedure
├── analysis/
│   ├── compute_ces.py          # Upgraded CES analysis with split layers
│   └── visualize_results.py    # Visualization tools
├── tasks/
│   ├── task1_conditional.py    # Task 1: Python version
│   ├── task1_eplus.eplus       # Task 1: E+ version
│   ├── task2_nested.py         # Task 2: Python version
│   ├── task2_eplus.eplus       # Task 2: E+ version
│   ├── task3_state.py          # Task 3: Python version
│   └── task3_eplus.eplus       # Task 3: E+ version
└── ../tests/                   # Test data and results (separate directory)
    ├── experiment_data.json
    ├── experiment_data_ces_upgraded.json
    └── *.png (visualizations)
```

## Quick Start

### 1. Run the Analysis

```bash
cd /workspace/experiment-framework/analysis
python3 compute_ces.py
```

This will:
- Load sample experiment data
- Compute all CES components (OE, CE, SS, BF)
- Calculate delta scores (E+ minus Python)
- Export results to `/workspace/tests/experiment_data_ces_upgraded.json`

### 2. View Results

The analysis outputs:
- **Composite CES**: Overall cognitive efficiency score
- **Component Breakdown**: 
  - Δ Objective Efficiency (performance)
  - Δ Cognitive Experience (subjective)
  - Δ Structural Simplicity (validator-based)
  - Δ Behavioral Friction (interaction patterns)

### 3. Interpret Results

| ΔCES Range | Meaning |
|------------|---------|
| > +10 | Strong improvement with E+ |
| +3 to +10 | Moderate improvement |
| -3 to +3 | No meaningful difference |
| < -3 | E+ performs worse |

## CES Model (Upgraded)

The new split-layer approach separates concerns:

1. **Objective Efficiency (35%)**: Pure performance, no subjective bias
2. **Cognitive Experience (30%)**: Subjective mental load and clarity
3. **Structural Simplicity (20%)**: Validator-measured code structure
4. **Behavioral Friction (15%)**: Interaction patterns and hesitation

This prevents any single metric from dominating the score.

## Running Your Own Experiment

### Step 1: Recruit Participants
Target 6-12 intermediate developers familiar with Python.

### Step 2: Collect Data
For each participant and task, record:
- Time to completion (seconds)
- Correctness (0-100%)
- Validator metrics (for E+)
- Subjective ratings (1-10 scale)
- Behavioral metrics (rewrites, pauses)

### Step 3: Format Data

Create JSON in this format:

```json
{
  "participants": [
    {
      "participant_id": 1,
      "mode": "python",
      "task_id": 1,
      "time_seconds": 420,
      "correctness": 90,
      "validator_score": 0,
      "nesting_depth": 4,
      "warning_count": 0,
      "operator_density": 4,
      "mental_load": 7,
      "clarity": 7,
      "confidence": 7,
      "frustration": 6,
      "rewrites": 2,
      "pause_count": 3,
      "total_pause_time": 15.0,
      "error_rate": 10
    }
  ]
}
```

### Step 4: Analyze

Run `compute_ces.py` with your data file.

## Tasks Included

### Task 1: Conditional Complexity
Multi-branch decision system for user classification.
Tests: branching logic, condition decomposition

### Task 2: Nested Reasoning
Process users with nested activity/balance checks.
Tests: nesting depth, flow clarity

### Task 3: State + Loop
Resource monitor with threshold-based alerts.
Tests: loop management, state tracking, elif chains

## Key Features

✅ **Split-layer CES model** - Prevents metric dominance  
✅ **Behavioral friction tracking** - Captures cognitive hesitation  
✅ **Within-subject design support** - Controls for skill variance  
✅ **Counterbalancing ready** - Handles order effects  
✅ **Clear success criteria** - Defined validation thresholds  

## Next Steps

After collecting real data:
1. Run analysis
2. Check which components drive results
3. Refine validator rules based on findings
4. Iterate on task design if needed

See `EXPERIMENT_PROTOCOL.md` for complete procedural details.
