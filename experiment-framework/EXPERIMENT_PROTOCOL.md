# E+ Cognitive Load Experiment Protocol

## Overview
This experiment tests whether E+ reduces cognitive load while maintaining code quality compared to traditional Python programming.

## Hypothesis
**Primary:** Developers using E+ will produce lower cognitive complexity solutions with less mental effort than those using direct Python coding.

**Secondary:**
- H1: E+ users will write simpler logic structures (measurable via validator)
- H2: E+ users will make fewer structural errors
- H3: E+ users will refactor more naturally

## Experimental Design

### Participants
- **Target:** 6-12 developers
- **Skill level:** Intermediate (familiar with Python/JS)
- **Requirement:** No prior E+ exposure

### Design Type
**Within-subject design** (recommended):
- Each participant completes tasks in BOTH modes
- Order is counterbalanced (half do Python first, half do E+ first)
- Removes skill/intelligence bias

## Tasks

### Task 1: Conditional Complexity
Build a decision system for user classification:
- If age > 18 AND score > 80 → "premium"
- If age > 18 AND score > 50 → "standard"
- If score < 50 OR flagged → "review"
- Else → "reject"

**Files:** `tasks/task1_conditional.py`, `tasks/task1_eplus.eplus`

### Task 2: Nested Reasoning
Process users with nested conditions:
- For each user, check activity status
- If active, check balance against threshold
- Mark as "priority", "standard", or "inactive"

**Files:** `tasks/task2_nested.py`, `tasks/task2_eplus.eplus`

### Task 3: State + Loop
Simulate a resource monitor:
- Track CPU and RAM readings
- Trigger alerts/warnings based on thresholds
- Record all actions taken

**Files:** `tasks/task3_state.py`, `tasks/task3_eplus.eplus`

### Task 4: Data Transformation (Hostile Task)
Process user data with filtering, mapping, and aggregation:
- Filter active users from list
- Extract and compute statistics (count, sum, average, max, min)
- Classify performance based on average score
- Output results

**Purpose:** Tests compression vs decomposition trade-off. Python can use list comprehensions; E+ requires explicit steps.

**Files:** `tasks/task4_data.py`, `tasks/task4_eplus.eplus`

## Metrics

### A. Objective Metrics (Hard Data)

1. **Time to Completion** (seconds)
   - Start → correct solution

2. **Correctness** (0-100%)
   - % of test cases passed

3. **Structural Complexity**
   - Nesting depth
   - Operator density
   - Validator warnings

### B. Behavioral Metrics

1. **Rewrite Count**
   - Number of major restructures

2. **Pause Count**
   - Pauses > 5 seconds (cognitive friction proxy)

3. **Total Pause Time**
   - Total hesitation time in seconds

### C. Subjective Metrics (NASA-TLX Style)

After each task, participants rate (1-10):
- **Mental Load:** How mentally demanding was this?
- **Clarity:** How clear was your thinking?
- **Confidence:** How confident are you in the solution?
- **Frustration:** How frustrated did you feel?

## CES Analysis Model

The Cognitive Efficiency Score (CES) combines all metrics:

### Split Layer Approach

1. **Objective Efficiency (OE)**
   ```
   OE = Quality × Time_Score
   Where:
   - Quality = (correctness × 0.6) + (structure × 0.4)
   - Time_Score = 100 - (time/1200 × 100)
   ```

2. **Cognitive Experience (CE)**
   ```
   CE = avg(mental_load, clarity, confidence, frustration) [all normalized]
   ```

3. **Structural Simplicity (SS)**
   ```
   SS = validator_score - penalties
   Penalties: nesting (>3), warnings, operator_density (>2)
   ```

4. **Behavioral Friction (BF)**
   ```
   BF = avg(rewrite_score, pause_score, hesitation_score, error_score)
   ```

### Composite CES
```
CES = (OE × 0.35) + (CE × 0.30) + (SS × 0.20) + (BF × 0.15)
```

## Procedure

### Step 1: Baseline (Python)
- Give Python task first (no E+ exposure)
- No guidance beyond requirements
- Record all metrics

### Step 2: E+ Introduction
- 5-10 minute onboarding
- Show: basic syntax, validator feedback, preview panel
- Practice example (not counted)

### Step 3: E+ Tasks
- Same complexity level as Python tasks
- Different but equivalent problems
- Full metric collection

### Step 4: Counterbalancing
- Half participants: Python → E+
- Half participants: E+ → Python
- Controls for learning effects

## Success Criteria

### Strong Validation
- Mean ΔCES ≥ +8
- Structure significantly better
- Mental load reduced

### Weak Validation
- Structure better
- Effort slightly higher
- Still promising direction

### Failure
- No structure improvement
- Higher frustration
- Slower without quality gain

## Data Collection

All data stored in `/workspace/tests/`:
- `experiment_data.json` - Raw participant data
- `experiment_data_ces_upgraded.json` - CES analysis results
- Visualization plots (PNG files)

## Running Analysis

```bash
cd /workspace/experiment-framework/analysis
python compute_ces.py
```

This generates:
- Component breakdowns (OE, CE, SS, BF)
- Delta scores (E+ minus Python)
- Aggregate statistics
- Exported JSON results

## Interpretation Guidelines

### ΔCES Meaning
| Range | Interpretation |
|-------|---------------|
| > +10 | Strong improvement |
| +3 to +10 | Moderate improvement |
| -3 to +3 | No meaningful difference |
| < -3 | E+ worse than Python |

### Key Questions
1. Are warnings accurate or annoying?
2. Do participants feel helped or hindered?
3. Does structure actually improve?
4. Is the tradeoff worth it?

## Next Steps After Data Collection

1. Run CES analysis
2. Check component-level deltas
3. Identify which metrics drive results
4. Refine validator rules based on findings
5. Iterate on task design if needed

---

**Important:** This experiment tests whether E+ improves thinking under complexity, not whether it's universally "better." Success means proving value for specific use cases (monitoring, logic control, explanation-heavy code).
