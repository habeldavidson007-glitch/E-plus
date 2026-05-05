# Experiment Protocol 1: Messy Workflow Test

## Objective
Test whether E+ helps or hinders developers when dealing with broken, non-linear code.

## Setup
- **Participants**: 6-10 developers (mixed experience levels)
- **Time Limit**: 15 minutes per task
- **Tools**: VSCode with E+ extension, Python environment

## Task Description

### Scenario: Broken User Processor
Participants receive this buggy Python code:

```python
def process_users(users):
    return [(u.name, 'premium' if u.balance > 100 else 'basic') 
            for u in users if u.active and u.verified]
```

**Bug**: The logic incorrectly assigns 'standard' tier (missing entirely).

### Instructions
1. Identify the bug
2. Fix it to include 'standard' tier for balance > 50
3. Add logging to trace execution

### Conditions
- **Group A**: Fix in Python directly
- **Group B**: Rewrite in E+, fix, then collapse back to Python

## Metrics to Collect

### Objective
- Time to identify bug (seconds)
- Time to implement fix (seconds)
- Correctness of final solution (0-1 scale)
- Number of test cases passed

### Behavioral
- Rewrite count (how many times structure changed)
- Pause duration before key insights
- Validator warnings triggered (Group B only)
- Mode switches (Group B: expand/collapse usage)

### Subjective (Post-task survey)
- Mental effort required (1-10)
- Confidence in solution (1-10)
- "I understood the flow clearly" (1-10)
- Frustration level (1-10)

## Success Criteria

E+ demonstrates value if:
- ✅ Group B identifies bugs faster (>20% improvement)
- ✅ Group B has higher confidence scores
- ✅ Group B produces more complete fixes
- ⚠️ Time penalty acceptable if correctness improves

## Red Flags (Abandonment Indicators)
- Participant asks to switch back to Python mid-task
- Participant ignores validator warnings completely
- Participant expresses frustration with "too many steps"
- Rewrite count > 5 without progress

## Data Collection Script

```bash
# Run experiment
python experiment-framework/run_experiment.py \
  --protocol messy-workflow \
  --output data/messy_workflow_results.json
```

## Analysis Questions
1. At what point did E+ users "get stuck"?
2. Did the validator help identify the missing logic?
3. Was the expand/collapse workflow smooth or disruptive?
4. Which persona types benefited most?

---

# Experiment Protocol 2: Time Pressure Test

## Objective
Determine under what time constraints developers abandon E+ for Python.

## Setup
- **Participants**: 8-12 developers
- **Tasks**: 3 progressively harder logic problems
- **Conditions**: Randomized time limits (3min, 7min, 12min)

## Procedure

### Phase 1: Baseline (No time pressure)
- Complete Task 1 in E+ at own pace
- Record natural workflow

### Phase 2: Moderate Pressure (7 minutes)
- Complete Task 2 in E+
- Countdown timer visible
- Note any shortcuts taken

### Phase 3: High Pressure (3 minutes)
- Complete Task 3
- **Option to switch to Python available**
- Track who switches and when

## Critical Measurement Points

### Switching Behavior
- Timestamp of first consideration to switch
- Timestamp of actual switch (if occurs)
- Reason given for switching

### Code Quality Under Pressure
Compare E+ code at different time pressures:
- Does structure degrade?
- Do users start using `sys` escapes?
- Do they ignore validator warnings?

## Hypothesis
Under high time pressure:
- Senior developers will abandon E+ within 60 seconds
- Junior developers will persist but produce incomplete solutions
- Intermediate developers will show mixed behavior

## Success Criteria
E+ survives time pressure if:
- ✅ <30% of participants switch to Python voluntarily
- ✅ Code structure remains valid even under pressure
- ✅ Participants report "feeling guided" rather than "restricted"

## Debrief Questions
1. "At what point did you consider switching tools?"
2. "Did E+ slow you down or focus you?"
3. "Would you use this for quick debugging sessions?"
4. "What feature would make you stay in E+ longer?"

---

# Experiment Protocol 3: Hybrid Mode Validation

## Objective
Validate that bidirectional translation (Python ⇄ E+) reduces abandonment.

## Setup
- **Participants**: 10 developers (all intermediate+)
- **Task**: Debug and optimize a complex function

## Workflow Options Provided

### Option A: Pure E+
Write everything in E+ from scratch

### Option B: Pure Python  
Write everything in Python from scratch

### Option C: Hybrid (Recommended)
1. Start with existing Python code
2. Expand to E+ for debugging
3. Fix issues in E+
4. Collapse back to Python
5. Selectively re-expand problematic sections

## Metrics

### Adoption Rate
- % who choose hybrid mode spontaneously
- % who need prompting to try hybrid

### Efficiency Gains
- Time to find bugs (Hybrid vs Pure approaches)
- Code quality after optimization
- Number of iterations completed

### Friction Points
- Translation errors (Python→E+→Python roundtrip)
- Information loss during collapse
- Cognitive overhead of mode switching

## Expected Outcomes

If hybrid mode works:
- ✅ 70%+ participants prefer hybrid after trying it
- ✅ Bug detection time reduced by 30%+
- ✅ Lower reported mental load vs pure approaches

If hybrid mode fails:
- ❌ Users find switching confusing
- ❌ Translation introduces new bugs
- ❌ Overhead outweighs benefits

## Key Insight to Capture
**The "Aha!" Moment**: When does a developer realize hybrid mode is valuable?
- Is it during first expansion?
- During debugging in E+?
- After collapsing optimized code?

Track and timestamp these moments.

---

# Running the Experiments

```bash
# Install dependencies
pip install -r experiment-framework/requirements.txt

# Run all protocols sequentially
python experiment-framework/run_all_protocols.py \
  --participants 10 \
  --output-dir experiment-data/ \
  --record-sessions

# Generate analysis report
python experiment-framework/analyze_results.py \
  --input experiment-data/ \
  --report experiment-report.md
```

# Post-Experiment Analysis Framework

After collecting data, answer:

1. **Persona Segmentation**
   - Which developer types benefit most from E+?
   - Which types consistently reject it?
   - Is there a skill level "sweet spot"?

2. **Task Dependency**
   - For which task types does E+ excel?
   - Where does it fail?
   - What characteristics predict success?

3. **Validator Impact**
   - Are warnings helpful or annoying?
   - Do they correlate with better outcomes?
   - What's the optimal strictness level?

4. **Hybrid Viability**
   - Does expand/collapse reduce abandonment?
   - Is the translation accurate enough?
   - What improvements are needed?

5. **Strategic Direction**
   Based on results, recommend:
   - Target audience (juniors? debuggers? learners?)
   - Primary use case (teaching? debugging? prototyping?)
   - Feature priorities (better translation? looser validation?)
