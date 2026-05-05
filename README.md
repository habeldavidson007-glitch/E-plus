# E+ Programming Language

**A cognitive-first programming interface with measurable behavior constraints.**

E+ is not a replacement for Python—it's a **cognitive zoom lens** that makes thinking visible, enforces clarity, and adapts to developer expertise.

---

## Quick Start

```bash
# Install VSCode extension
cd vscode-extension && code --install-extension eplus-0.1.0.vsix

# Create your first E+ file
echo '? (score > 80) →
    > "Excellent"
else ? (score > 50) →
    > "Good"
else →
    > "Needs improvement"' > test.eplus

# Run with validator
eplus validate test.eplus
```

---

## Core Philosophy

### One Thought Per Line
Each line represents a single cognitive step:
```eplus
# ❌ Too dense
score = cpu + ram * 2 - users / 2

# ✅ One thought
ram_weight = ram * 2
user_penalty = users / 2
score = cpu + ram_weight - user_penalty
```

### Explicit Over Implicit
```eplus
# Clear branching
? (user.active) →
    ? (user.balance > 100) →
        tier = "premium"
    else ? (user.balance > 50) →
        tier = "standard"
    else →
        tier = "basic"
```

### Measurable Cognition
Every file gets a **Cognitive Score** (0-100) based on:
- Expression density
- Nesting depth  
- Entity count
- Branch complexity

---

## Project Structure

```
/workspace
├── src/                      # Core language implementation
│   ├── tokenizer.py          # Lexical analysis
│   ├── parser.py             # Syntax parsing
│   ├── ast_nodes.py          # AST definitions
│   ├── validator.py          # Cognitive validation
│   └── transpiler_*.py       # Multi-target code generation
├── vscode-extension/         # VSCode integration
│   ├── src/extension.ts      # Extension entry point
│   ├── src/validator.ts      # Real-time diagnostics
│   └── src/preview.ts        # Live transpilation preview
├── hybrid-engine/            # Bidirectional translation
│   ├── expander.py           # Python → E+ expansion
│   ├── collapser.py          # E+ → Python compression
│   └── friction_simulator.py # Persona-based friction analysis
├── experiment-framework/     # Scientific validation
│   ├── ces_model.py          # Cognitive Efficiency Score
│   ├── tasks.py              # Experimental tasks
│   └── analyzer.py           # Results analysis
├── experiment-protocols/     # Ready-to-run studies
│   └── targeted_tests.md     # Messy workflow, time pressure, hybrid tests
└── tests/                    # Test files
    ├── stress_test.eplus     # Complex logic validation
    └── clean_code.eplus      # Simple logic validation
```

---

## Key Features

### 🔍 Cognitive Validator
Detects and warns about:
- Dense expressions (>2 operators)
- Deep nesting (>3 levels)
- Complex conditions (>2 logical operators)
- Unsafe `sys` escapes

### 🔄 Hybrid Mode
Switch between cognitive modes:
```bash
# Expand Python for debugging
eplus expand complex.py --output debug.eplus

# Collapse E+ for production
eplus collapse solution.eplus --output optimized.py
```

### 📊 Cognitive Scoring
Measures code clarity:
- **90-100**: Excellent cognitive flow
- **70-89**: Good, minor improvements possible
- **50-69**: Moderate complexity, consider refactoring
- **<50**: High cognitive load, refactor recommended

### 🎯 Multi-Target Transpilation
Write once, deploy anywhere:
```bash
eplus compile app.eplus --target python
eplus compile app.eplus --target cpp
eplus compile app.eplus --target gdscript
```

---

## Who Is E+ For?

### ✅ Ideal Use Cases
- **Learning**: Juniors understand flow step-by-step
- **Debugging**: Trace complex logic visually
- **Code Review**: Make implicit reasoning explicit
- **Documentation**: Self-documenting code structure
- **Team Alignment**: Shared cognitive model

### ❌ Not For
- Performance-critical inner loops
- Data transformation pipelines (use Python directly)
- Experienced devs who prefer compression
- situations where speed > clarity

---

## Experimental Validation

E+ includes a complete scientific framework to measure cognitive load:

### CES (Cognitive Efficiency Score)
```
CES = (Objective Efficiency × 0.35) + 
      (Cognitive Experience × 0.30) + 
      (Structural Simplicity × 0.20) + 
      (Behavioral Friction × 0.15)
```

### Running Experiments
```bash
# Execute all protocols
python experiment-framework/run_all_protocols.py \
  --participants 10 \
  --output-dir results/

# Analyze results
python experiment-framework/analyze.py \
  --input results/ \
  --report findings.md
```

### Research Findings (Simulated)
- **Juniors**: +25% clarity, +15% correctness
- **Debugging**: 40% faster bug detection
- **Seniors**: Initial resistance, then selective adoption
- **Hybrid Mode**: Reduces abandonment by 60%

---

## Example: Task Manager

```eplus
## Simple Task Manager

tasks = []

[add_task] (task) →
    tasks = tasks + [task]
    > "Added task"

[show_tasks] () →
    repeat item in tasks →
        > item

[main] () →
    repeat forever →
        action = < "add/show/exit"
        
        ? (action == "add") →
            t = < "Enter task"
            call add_task(t)
        
        else ? (action == "show") →
            call show_tasks()
        
        else ? (action == "exit") →
            > "Goodbye"
            return

call main()
```

**Transpiles to clean Python:**
```python
tasks = []

def add_task(task):
    tasks.append(task)
    print("Added task")

def show_tasks():
    for item in tasks:
        print(item)

while True:
    action = input("add/show/exit: ")
    
    if action == "add":
        t = input("Enter task: ")
        add_task(t)
    elif action == "show":
        show_tasks()
    elif action == "exit":
        print("Goodbye")
        break
```

---

## Documentation

- **[Hybrid Mode Guide](hybrid-engine/HYBRID_MODE_GUIDE.md)** - When and how to switch modes
- **[Experiment Protocols](experiment-protocols/targeted_tests.md)** - Run controlled studies
- **[Validator Rules](src/language/validator.py)** - Cognitive constraint definitions

---

## Status

- ✅ Language syntax stabilized
- ✅ Cognitive validator implemented
- ✅ Multi-target transpilation working
- ✅ VSCode extension functional
- ✅ Scientific validation framework ready
- 🧪 Real-world user testing pending

---

## Next Steps

1. **Run experiments** with real developers
2. **Refine validator** based on friction data
3. **Improve hybrid mode** translation accuracy
4. **Build case studies** from successful debugging sessions

---

## Philosophy Statement

> "E+ doesn't make you think differently. It makes your thinking visible."

The goal is not to replace Python or other languages, but to provide a **cognitive interface layer** that:
- Expands compressed thinking when clarity matters
- Collapses explicit logic when performance matters
- Measures and improves how we structure thought in code

---

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please read CONTRIBUTING.md before submitting PRs.
