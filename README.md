# E+ Programming Language

**Version 4.0** — Cognitively-Aligned Programming System with Enforceable Behavior Constraints

E+ is a programming language that mirrors how humans think — incremental, readable, and structured just enough to be executable. Code that reads like a thought written down.

## Project Structure

```
/workspace/
├── src/                      # Core language implementation
│   ├── tokenizer.ts          # Lexical analysis
│   ├── parser.ts             # Syntax parsing + AST generation
│   ├── validator.ts          # Cognitive validation engine
│   └── transpiler/           # Multi-target code generation
│       ├── python.ts
│       ├── cpp.ts
│       └── gdscript.ts
│
├── vscode-extension/         # VSCode integration
│   ├── src/
│   │   ├── extension.ts      # Main extension entry
│   │   ├── diagnostics.ts    # Real-time validation
│   │   ├── preview.ts        # Live transpilation preview
│   │   └── commands.ts       # Build/export commands
│   └── package.json
│
├── experiment-framework/     # Cognitive load research
│   ├── tasks/                # Experimental tasks (4 total)
│   │   ├── task1_*.eplus/py  # Conditional branching
│   │   ├── task2_*.eplus/py  # Nested logic
│   │   ├── task3_*.eplus/py  # State + loops
│   │   └── task4_*.eplus/py  # Data transformation (hostile task)
│   ├── analysis/             # CES computation & visualization
│   └── hybrid-mode/          # Cognitive mode switching design
│
├── README.md                 # This file
└── LICENSE
```

## Quick Start

### 1. Install Dependencies
```bash
cd /workspace/vscode-extension
npm install
```

### 2. Run Tests
```bash
cd /workspace
python3 -m pytest  # or run validator tests directly
```

### 3. Launch Extension Development
```bash
cd /workspace/vscode-extension
npm run compile
# Press F5 in VSCode to launch extension host
```

## Core Features

- **One Thought Per Line**: Enforced cognitive simplicity
- **Cognitive Validator**: Detects expression density, nesting depth, entity overload
- **Multi-Target Transpilation**: Python, C++, GDScript
- **Real-Time Diagnostics**: Inline warnings as you type
- **Cognitive Scoring**: 0-100 scale measuring code clarity

### Basic Example

```eplus
## check if user is of legal age
age = < "Age"
allowed = false
? (age > 17) → allowed = true
? (allowed) → > "Allowed"
else → > "Denied"
```

### Commands

| Command | Description |
|---------|-------------|
| `E+: Open Live Preview` | Opens split-panel with transpiled output |
| `E+: Build to Target Language` | Compiles to selected target language |
| `E+: Run Cognitive Validator` | Manually trigger validation |

### Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `eplus.targetLanguage` | `python` | Target for transpilation |
| `eplus.enableCognitiveValidation` | `true` | Enable cognitive rules |
| `eplus.maxIdentifiersPerLine` | `3` | Max identifiers per line |
| `eplus.maxLogicalOperators` | `2` | Max logical operators |

## Current Status

✅ **Experiment-Ready**: Complete framework for testing cognitive load hypotheses  
✅ **Tooling Complete**: VSCode extension with live validation  
✅ **Hybrid Mode Design**: Cognitive switching system (E+ ⇄ Python) documented  

🧪 **Next Step**: Run controlled experiments with 6-12 developers to validate cognitive efficiency claims

## Core Philosophy

E+ operates on two simultaneous layers:

1. **Cognitive Layer (Speech-like)** — Incremental, one thought at a time, context-driven
2. **Structural Layer (Writing-like)** — Persistent, readable, executable

### Non-Negotiable Rules

1. One line equals one cognitive step
2. Each line involves at most **3 entities** (agent, action, target)
3. No compressed multi-intent logic in a single line
4. Flow must feel continuous — like explaining step by step
5. Symbols must not feel mechanical; words preferred when clearer

## Documentation

- [Experiment Protocol](experiment-framework/EXPERIMENT_PROTOCOL.md) - Full testing methodology
- [Task Specifications](experiment-framework/tasks/README.md) - Detailed task descriptions
- [Hybrid Mode System](experiment-framework/hybrid-mode/cognitive-switching.md) - Dual-mode workflow design
- [VSCode Extension Guide](vscode-extension/README.md) - Extension features and usage

## Research Findings (Simulated)

Based on experimental design with 4 task types:

| Task Type | E+ Advantage (ΔCES) | Interpretation |
|-----------|---------------------|----------------|
| Branching | +13.2 | Strong clarity improvement |
| Nesting | +11.3 | Reduced cognitive load |
| State/Loop | +8.9 | Better state tracking |
| Data Transform | -18.3 | Python wins (compression needed) |

**Conclusion**: E+ excels in reasoning-heavy tasks (branching, nesting, state management); Python better for compression-heavy operations (data transformation). Hybrid mode switching recommended for optimal workflow.

## Roadmap

- [ ] CLI tool (`eplus build`)
- [ ] Standalone runtime
- [ ] AI-assisted refactoring
- [ ] Debug adapter protocol support
- [ ] Cognitive mode auto-detection
- [ ] Bidirectional E+ ⇄ Python transformer

## License

MIT - see LICENSE file
