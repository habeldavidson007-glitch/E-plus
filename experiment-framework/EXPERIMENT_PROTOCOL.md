# E+ Cognitive Load Experiment Framework

## Overview
This framework provides a controlled experimental protocol to measure whether E+ actually reduces cognitive load in real coding tasks.

## Primary Hypothesis
**Developers using E+ will produce lower cognitive complexity solutions with less mental effort than those using direct Python coding.**

## Secondary Hypotheses
- **H1**: E+ users will write simpler logic structures (measurable via validator scores)
- **H2**: E+ users will make fewer structural errors
- **H3**: E+ users will refactor more naturally

---

## Experimental Design

### Participants
- **Target**: 6-12 developers
- **Skill level**: Intermediate (familiar with Python/JavaScript)
- **Requirement**: No prior E+ exposure

### Design Type
**Within-subject design** (recommended)
- Each participant completes tasks in BOTH modes:
  - Task A: Python (control)
  - Task B: E+ (experimental)
- Order is swapped for half participants to eliminate learning bias

---

## Tasks

### Task 1: Conditional Complexity
**Goal**: Build a decision system for user classification

**Requirements**:
```
- If age > 18 AND score > 80 → "premium"
- If age > 18 AND score > 50 → "standard"  
- If score < 50 OR flagged → "review"
- Else → "reject"
```

**Files**: `tasks/task1_decision_system.py`, `tasks/task1_decision_system.eplus`

### Task 2: Nested Reasoning
**Goal**: Process user list with multi-level conditions

**Requirements**:
```
- For each user:
  - Check if active
  - If active:
    - If balance > threshold:
      - Mark as "priority"
    - Else:
      - Mark as "normal"
  - Else:
    - Mark as "inactive"
```

**Files**: `tasks/task2_user_processor.py`, `tasks/task2_user_processor.eplus`

### Task 3: State + Loop (Resource Monitor)
**Goal**: Simulate continuous resource monitoring

**Requirements**:
```
- Loop continuously (or fixed iterations)
- Track CPU, RAM, user count
- If CPU > 80 AND RAM > 70:
  - Trigger alert
- Else if CPU > 60 OR RAM > 50:
  - Log warning
- Else:
  - Log normal status
```

**Files**: `tasks/task3_resource_monitor.py`, `tasks/task3_resource_monitor.eplus`

---

## Metrics Collection

### A. Objective Metrics (Hard Data)

1. **Time to Completion** (seconds)
   - Start timestamp → correct solution timestamp

2. **Structural Complexity**
   - Nesting depth (max)
   - Operator count per line
   - Condition length (logical operators)
   - Validator warnings count
   - Final cognitive score (0-100)

3. **Error Rate**
   - Logical bugs count
   - Missed conditions count
   - Incorrect branching count

### B. Behavioral Metrics

1. **Number of Rewrites**
   - Count of delete + restructure actions
   - Tracked via VSCode extension logs

2. **Iteration Pattern**
   - Linear build vs chaotic jumping
   - Qualitative observation tag

### C. Subjective Metrics (NASA-TLX Style)

After EACH task, participant rates (1-10 scale):
1. **Mental Effort**: How hard did you have to think?
2. **Frustration Level**: How frustrating was the task?
3. **Clarity of Thinking**: How clear was your thought process?
4. **Confidence**: How confident are you in your solution?

---

## Procedure

### Step 1: Baseline (Python Task)
- Give participant Task 1 in Python
- No guidance or hints
- Record all metrics

### Step 2: E+ Onboarding (5-10 minutes)
- Show basic E+ syntax
- Demonstrate validator feedback
- Explain preview panel
- Let them try a trivial example

### Step 3: E+ Task
- Give equivalent task in E+
- Same complexity level, different problem
- Record all metrics

### Step 4: Swap Order (for 50% of participants)
- Half do E+ first, then Python
- Eliminates learning bias

---

## Data Analysis Model

### Cognitive Efficiency Score (CES) Formula

**CES = (Quality / Effort) × Clarity**

Where:

#### 1. Quality Score (0-100)
```
Quality = (Correctness × 0.6) + (Structure Score × 0.4)

Correctness = % of requirements satisfied (0-100)
Structure Score = 100 - (warnings × 5 + nesting_penalty + density_penalty)
```

Example:
- Correctness: 90%
- Warnings: 3 → 15 penalty
- Structure Score: 85
- Quality = (90 × 0.6) + (85 × 0.4) = 88

#### 2. Effort Score (0-100, lower is better)
```
Effort = (Time_norm × 0.4) + (Mental_load_norm × 0.4) + (Rewrites_norm × 0.2)

Time_norm = normalized task time (0-100)
Mental_load_norm = self-reported mental effort (scaled 0-100)
Rewrites_norm = normalized rewrite count (0-100)
```

#### 3. Clarity Score (0-100)
```
Clarity = (Confidence + Clarity_rating) / 2
Both from 1-10 → scaled to 0-100
```

### Normalization
Use min-max normalization for all raw values:
```
norm(x) = (x - min) / (max - min) × 100
```

---

## Success Criteria

### ΔCES (Delta CES) Interpretation
For each participant: `ΔCES = CES_E+ - CES_Python`

| ΔCES Range | Meaning |
|------------|---------|
| > +10 | Strong improvement |
| +3 to +10 | Moderate improvement |
| -3 to +3 | No meaningful difference |
| < -3 | E+ performed worse |

### Validation Thresholds

**Strong Validation**:
- mean(ΔCES) ≥ +8
- Structure significantly better
- Mental load reduced

**Weak Validation** (still promising):
- Structure better
- Effort slightly higher

**Failure**:
- No structure improvement
- Higher frustration
- Slower without quality gain

---

## Data Collection Template

Each participant produces JSON records:

```json
{
  "participant_id": 1,
  "mode": "python",
  "task_id": 1,
  "time_seconds": 420,
  "correctness_percent": 85,
  "validator_warnings": 3,
  "max_nesting_depth": 4,
  "max_operators_per_line": 6,
  "cognitive_score": 70,
  "mental_load_rating": 7,
  "frustration_rating": 6,
  "confidence_rating": 6,
  "clarity_rating": 5,
  "rewrite_count": 12,
  "errors_count": 2
}
```

---

## Analysis Scripts

Run these after data collection:

1. `analysis/compute_ces.py` - Calculate CES for each record
2. `analysis/compare_modes.py` - Within-subject ΔCES analysis
3. `analysis/visualize_results.py` - Generate charts and plots
4. `analysis/qualitative_tags.py` - Analyze observation notes

---

## Expected Outcomes

If E+ works as intended:
- **Slightly slower** initial writing (learning curve)
- **Significantly cleaner** logic structure
- **Lower reported** cognitive load on complex tasks
- **Fewer structural** errors

---

## Next Steps

1. Recruit 6-12 intermediate developers
2. Prepare task files in both Python and E+
3. Set up VSCode with E+ extension for testing
4. Run pilot test with 1-2 participants
5. Refine procedure based on pilot feedback
6. Execute full experiment
7. Analyze results and iterate
