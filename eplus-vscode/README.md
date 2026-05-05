# E+ Language - VSCode Extension

**Version 4.0** — Cognitively-Aligned Conversational Programming Language

E+ is a programming language that mirrors how humans think — incremental, readable, and structured just enough to be executable. Code that reads like a thought written down.

## Features

- 🗣️ **Cognitive-First Syntax** — One line equals one cognitive step
- 📝 **Live Preview** — Real-time transpilation to Python, C++, or GDScript
- ⚠️ **Cognitive Validator** — Enforces human-thought-aligned constraints
- 🎨 **Syntax Highlighting** — Full TextMate grammar support
- 💡 **Smart Diagnostics** — Inline warnings for cognitive violations
- 🔧 **Quick Fixes** — Automated suggestions to split complex logic

## Installation

1. Clone this repository
2. Run `npm install`
3. Press `F5` to launch the Extension Development Host
4. Open an `.e+` or `.eplus` file to activate

## Usage

### Basic Example

```e+
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

## Project Structure

```
eplus-vscode/
├── src/
│   ├── extension.ts          # Entry point
│   ├── language/             # Core language processing
│   │   ├── tokenizer.ts      # Lexer
│   │   ├── parser.ts         # Recursive-descent parser
│   │   ├── ast.ts            # AST node definitions
│   │   ├── validator.ts      # Cognitive validator
│   │   └── transpiler/       # Code generators
│   ├── features/             # VSCode features
│   └── ui/                   # Webview UI
├── syntaxes/                 # TextMate grammar
└── language-configuration.json
```

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

## Roadmap

- [ ] CLI tool (`eplus build`)
- [ ] Standalone runtime
- [ ] AI-assisted refactoring
- [ ] Debug adapter protocol support

## License

MIT
