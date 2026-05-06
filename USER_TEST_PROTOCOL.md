# E+ User Testing Protocol (v0.1-dev)

**Goal:** Get 3-5 developers to try E+ and report friction points.

---

## Target Users

Recruit people who match:
- ✅ Moderate Python experience (1-3 years)
- ✅ Curious about new tools/languages
- ✅ Willing to give honest, critical feedback
- ❌ Not E+ contributors or close collaborators

---

## Session Structure (30-45 minutes)

### 1. Setup (5 min)
Send them this beforehand:
```bash
# Clone and install
git clone <your-repo-url>
cd vscode-extension
code --install-extension eplus-0.1.0.vsix

# Verify validator works
cd ..
python -m src.validator tests/clean_code.eplus
```

### 2. First Impressions (5 min)
Ask them to:
1. Open `README.md` and skim for 2 minutes
2. Say out loud: "What do you think this is?"
3. Note their immediate reaction (excitement? confusion? skepticism?)

**Record:**
- What confused them in the README?
- Did they understand "cognitive-first"?
- What was their gut reaction?

---

### 3. Hands-On Task #1: Simple Logic (10 min)

**Task:** Write a grade classifier in E+

```eplus
# Your task: Classify a score into grades
# A: >90, B: >80, C: >70, D: >60, F: else

score = 85

? (score > 90) →
    grade = "A"
else ? (score > 80) →
    grade = "B"
# ... continue this pattern

> grade
```

**Observe:**
- Do they understand the `? () →` syntax immediately?
- Do they try to write Python-style `if/else`?
- How long until they get the pattern?
- Do they run the validator? What errors appear?

**Ask after:**
- "How did this feel compared to Python?"
- "What felt weird or unnatural?"
- "Would you want to write more like this?"

---

### 4. Hands-On Task #2: Debug/Expand Mode (10 min)

**Task:** Use hybrid mode to expand a dense Python function

Give them this Python code:
```python
def calculate(cpu, ram, users):
    return cpu + ram * 2 - users / 2 if users > 0 else cpu + ram * 2
```

Ask them to:
```bash
eplus expand dense.py --output expanded.eplus
cat expanded.eplus
```

**Observe:**
- Do they understand what "expand" means?
- Is the output clearer or just longer?
- Would they actually use this for debugging?

**Ask after:**
- "Is this useful or just verbose?"
- "When would you actually use this?"
- "Does this help you understand code better?"

---

### 5. Cognitive Score Reaction (5 min)

Have them validate a file and see the score:
```bash
eplus validate some_file.eplus
# Shows: Cognitive Score: 67/100
```

**Ask:**
- "What do you think this score means?"
- "Would you try to improve it? Why or why not?"
- "Does this metric feel useful or arbitrary?"

---

### 6. Closing Questions (5 min)

**Critical Questions:**
1. "What was the most frustrating moment?"
2. "What was the most interesting moment?"
3. "Would you use this again? In what situation?"
4. "What one thing should we change first?"
5. "Who do you think this is actually for?"

**Optional:**
- "Does 'E+' make sense as a name?"
- "What would convince you to adopt this?"

---

## Data to Capture

For each session, record:

| Metric | Notes |
|--------|-------|
| Time to first successful E+ program | |
| Number of syntax errors made | |
| Validator errors encountered | |
| Facial expressions (confusion, delight, frustration) | |
| Quotes (exact words they said) | |
| Would they use again? (Y/N/Maybe) | |
| One thing to fix | |

---

## Red Flags to Watch For

🚩 **Stop and pivot if you hear:**
- "I don't get why this exists"
- "This is just verbose Python"
- "I'd never write code like this voluntarily"
- "The tooling is too hard to set up"

✅ **Green lights:**
- "Oh, I see when this would help"
- "This would've saved me last week when debugging X"
- "Can I try another example?"
- "My team would hate this BUT..."

---

## After Each Session

1. **Immediately write down:**
   - Top 3 friction points
   - One surprising insight
   - One thing to change before next session

2. **Within 24 hours:**
   - Fix ONE small thing they struggled with
   - Update this protocol if needed
   - Schedule next session

---

## Success Criteria

After 3-5 sessions, you should have:

- ✅ At least 2 people who said "I'd try this again"
- ✅ Clear list of top 5 friction points
- ✅ One specific feature to prioritize
- ✅ One specific thing to remove/simplify
- ✅ Better understanding of WHO this is actually for

---

## Quick Start Checklist

Before your first session:

- [ ] README is clear enough for a stranger
- [ ] VSCode extension installs without errors
- [ ] Validator runs on example files
- [ ] You have 2-3 `.eplus` example files ready
- [ ] You know how to screen-share and record (optional)
- [ ] You prepared a calm, non-defensive mindset

**Remember:** You're testing the idea, not defending it. Criticism is gold.

---

## Template Feedback Form

Copy-paste this after each session:

```markdown
## Session #___ - [Name/Initials] - [Date]

**Background:** [Python experience level, current role]

**First Impression:** 
[What they said when reading README]

**Task #1 Performance:**
- Time to complete: ___ min
- Errors made: ___
- Frustration level (1-5): ___

**Task #2 Performance:**
- Understood expand mode? (Y/N/Sort of)
- Found it useful? (Y/N/Maybe)

**Key Quotes:**
- "[exact quote]"
- "[exact quote]"

**Top 3 Friction Points:**
1. 
2. 
3. 

**One Thing to Change:**


**Would They Try Again?** (Y/N/Maybe)


**Notes:**

```

---

**Next Action:** Recruit your first tester TODAY. Send them a message like:

> "Hey! I'm testing a new programming interface that makes thinking visible. 
> Got 30 min this week to try it and tell me what sucks? No prep needed, 
> I'll walk you through it. Coffee/beer on me if local, or just good karma."
