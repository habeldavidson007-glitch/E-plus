# E+ Hybrid Mode Guide

## The Cognitive Zoom Concept

E+ is not a replacement for Python—it's a **cognitive zoom lens** that lets you:
- **Zoom In** (Python → E+): Expand dense code for debugging and understanding
- **Zoom Out** (E+ → Python): Collapse verbose logic for production performance

## When to Use Each Mode

### 📍 Use E+ (Zoomed In) When:
- Debugging complex logic bugs
- Onboarding junior developers
- Reviewing unfamiliar code
- Designing step-by-step algorithms
- Documenting decision flows
- Teaching programming concepts

### ⚡ Use Python (Zoomed Out) When:
- Writing performance-critical code
- Implementing well-understood patterns
- Data transformation pipelines
- Production deployment
- Code golf / rapid prototyping
- Working with experienced teams

## Workflow Examples

### Example 1: Debugging a Bug

**Start with buggy Python:**
```python
result = [(u.name, 'premium' if u.balance > 100 else 'basic') 
          for u in users if u.active]
```

**Expand to E+:**
```bash
eplus expand --input buggy.py --output debug.eplus
```

**Result in E+:**
```eplus
result = []

repeat user in users →
    ? (user.active) →
        tier = "basic"
        ? (user.balance > 100) →
            tier = "premium"
        
        result = result + [(user.name, tier)]
```

**Now you can see:**
- The missing 'standard' tier case
- Exactly where the logic branches
- Easy to add logging at each step

**Fix in E+:**
```eplus
result = []

repeat user in users →
    ? (user.active) →
        tier = "basic"
        ? (user.balance > 100) →
            tier = "premium"
        else ? (user.balance > 50) →
            tier = "standard"
        
        > "Processing:", user.name, "Tier:", tier  # Added logging
        result = result + [(user.name, tier)]
```

**Collapse back to Python:**
```bash
eplus collapse --input fixed.eplus --output fixed.py
```

**Production-ready Python:**
```python
result = []
for user in users:
    if user.active:
        tier = "premium" if user.balance > 100 else "standard" if user.balance > 50 else "basic"
        print("Processing:", user.name, "Tier:", tier)
        result.append((user.name, tier))
```

---

### Example 2: Learning Complex Logic

**Senior dev writes optimized Python:**
```python
scores = {u.id: sum(m.points for m in u.metrics if m.valid) * u.multiplier 
          for u in active_users if u.status == 'premium'}
```

**Junior dev expands to understand:**
```bash
eplus expand --input complex.py --output learning.eplus
```

**Expanded E+ makes it clear:**
```eplus
scores = {}

repeat user in active_users →
    ? (user.status == "premium") →
        total = 0
        
        repeat metric in user.metrics →
            ? (metric.valid) →
                total = total + metric.points
        
        final_score = total * user.multiplier
        scores[user.id] = final_score
```

---

## Command Reference

### Expand Python to E+
```bash
# Full expansion (maximum clarity)
eplus expand input.py --mode explicit

# Balanced expansion (some patterns kept compact)
eplus expand input.py --mode balanced

# Expand only specific functions
eplus expand input.py --functions process_data,validate_users
```

### Collapse E+ to Python
```bash
# Aggressive optimization
eplus collapse input.eplus --mode aggressive

# Conservative (preserve structure)
eplus collapse input.eplus --mode safe

# Selective collapse (keep some parts expanded)
eplus collapse input.eplus --keep-verbose debug_section,logging
```

### Interactive Mode
```bash
# Start hybrid REPL
eplus hybrid

# In the REPL:
>>> :expand my_function.py
>>> :edit  # Opens in editor
>>> :collapse
>>> :run
```

---

## VSCode Integration

### Keyboard Shortcuts
- `Ctrl+Shift+E`: Expand selection to E+
- `Ctrl+Shift+C`: Collapse selection to Python
- `Ctrl+Shift+H`: Toggle hybrid view (side-by-side)

### Context Menu
Right-click any Python code:
- "Expand to E+ for Debugging"
- "Collapse E+ to Python"
- "Compare: Python vs E+"

### Status Bar
Shows current mode:
- 🐍 Python Mode (compressed)
- 🧠 E+ Mode (expanded)
- 🔄 Hybrid Mode (both visible)

---

## Best Practices

### ✅ Do:
- Expand when you don't understand the code
- Collapse before committing to version control
- Use E+ for code reviews of complex logic
- Keep test files in E+ for clarity
- Switch modes based on task, not preference

### ❌ Don't:
- Force everything into E+ "for purity"
- Deploy E+ directly without collapsing
- Ignore validator warnings during expansion
- Stay in one mode for all tasks
- Treat E+ as "better"—it's "different for different purposes"

---

## Persona-Based Recommendations

### 👶 Junior Developers (1-2 years)
**Default to E+ more often**
- Expand all new code you're learning
- Write new features in E+ first
- Collapse only after validation passes
- Use E+ comments to document your thinking

### 🧑‍💻 Intermediate Developers (3-5 years)
**Use hybrid strategically**
- Write in Python normally
- Expand when debugging fails
- Collapse after fixing issues
- Learn to recognize when expansion would help

### 👨‍🏫 Senior Developers (7+ years)
**Leverage for specific scenarios**
- Expand code you're reviewing
- Use E+ to mentor juniors
- Collapse aggressively for production
- Trust your compression instincts but verify with expansion

### 🐛 Debugging Specialists
**Make E+ your primary tool**
- Always expand bug reports
- Reproduce in E+
- Fix with full visibility
- Collapse and test in Python

---

## Troubleshooting

### Problem: "Expansion loses context"
**Solution**: Use selective expansion
```bash
eplus expand input.py --only-function problematic_area
```

### Problem: "Collapse changes behavior"
**Solution**: Run tests after collapse
```bash
eplus collapse input.eplus --test-before-commit
```

### Problem: "Validator is too strict during exploration"
**Solution**: Use relaxed mode temporarily
```bash
eplus expand input.py --validator relaxed
```

### Problem: "Switching modes is slow"
**Solution**: Use VSCode side-by-side view
```
Ctrl+Shift+H → Edit in both simultaneously
```

---

## The Philosophy

> "E+ doesn't make you think differently. It makes your thinking visible."

Hybrid mode acknowledges:
- Experts think in compressed patterns (Python)
- Learners need explicit steps (E+)
- Debugging requires decompression
- Production needs optimization

The goal isn't to choose one—it's to **flow between them seamlessly**.

---

## Next Steps

1. **Try the workflow**: Take a buggy function and expand/fix/collapse
2. **Measure the difference**: Time yourself debugging in Python vs E+
3. **Find your threshold**: Notice when you naturally want to switch modes
4. **Share feedback**: Report friction points to improve the tool

```bash
# Quick start exercise
eplus tutorial --hybrid-basics
```
