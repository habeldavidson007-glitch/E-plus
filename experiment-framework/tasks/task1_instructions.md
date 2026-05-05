# Task 1: Decision System - Conditional Complexity

## Goal
Build a user classification system based on age and score criteria.

## Requirements

### Python Version (`task1_solution.py`)
Implement the following logic in Python:
- If age > 18 AND score > 80 → classify as "premium"
- If age > 18 AND score > 50 → classify as "standard"
- If score < 50 OR flagged → classify as "review"
- Else → classify as "reject"

### E+ Version (`task1_solution.eplus`)
Implement the same logic in E+, using:
- `? (condition) →` for branching
- `else ? (condition) →` for chained conditions
- `> "message"` for output

## Test Cases
Your solution should correctly handle:
1. age=25, score=85, flagged=false → "premium"
2. age=25, score=60, flagged=false → "standard"
3. age=25, score=45, flagged=false → "review"
4. age=17, score=90, flagged=false → "review" (under 18)
5. age=20, score=70, flagged=true → "review" (flagged)
6. age=20, score=55, flagged=false → "standard"

## Metrics to Record
After completing the task, note:
- [ ] Time taken (seconds)
- [ ] Number of rewrites/restarts
- [ ] Mental effort rating (1-10)
- [ ] Frustration level (1-10)
- [ ] Confidence in solution (1-10)
- [ ] Clarity of thinking (1-10)
- [ ] Any errors or bugs encountered

## Files
- `tasks/task1_instructions.md` - This file
- `tasks/task1_solution.py` - Your Python solution
- `tasks/task1_solution.eplus` - Your E+ solution

---

**Note**: Focus on writing clear, correct logic. Don't optimize prematurely.
