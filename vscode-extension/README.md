## E+ VSCode Extension - Cognitive Programming Language

A Visual Studio Code extension providing full support for the E+ programming language with real-time cognitive validation.

## Features

### 🧠 Real-Time Cognitive Validation
- **Inline Diagnostics**: Warnings appear directly in your editor as you type
- **Cognitive Scoring**: Get a 0-100 score measuring how well your code aligns with human thinking patterns
- **Smart Suggestions**: Actionable recommendations to simplify complex logic

### 🔍 What It Detects

#### Expression Density
```eplus
score = cpu + ram * 2 - users / 2  # ⚠️ Too many operators
```
**Suggestion**: Split into intermediate steps:
```eplus
ram_weight = ram * 2
user_penalty = users / 2
score = cpu + ram_weight - user_penalty
```

#### Nesting Depth
```eplus
? (a) →
    ? (b) →
        ? (c) →  # ⚠️ Nesting too deep
            ? (d) →
```
**Rule**: Maximum 3 levels of nesting

#### Complex Conditions
```eplus
? (cpu > 80 and ram > 70 and users > 3)  # ⚠️ Too many conditions
```
**Suggestion**: Use intermediate boolean variables

#### Sys Call Visibility
```eplus
result = sys "dangerous_operation()"  # ⚠️ Unsafe bypass warning
```
All `sys` calls are explicitly marked as cognitive escapes

### 🎯 Commands

- `E+: Validate` - Run cognitive validation on current file
- `E+: Show Score` - Display cognitive complexity score
- `E+: Preview` - Show transpiled output (Python/C++/GDScript)
- `E+: Build` - Export transpiled code to file

### ⚡ Quick Fixes

Click on any warning to see quick fix suggestions that automatically refactor your code into cognitively simpler forms.

## Installation

1. Clone the repository
2. Navigate to `vscode-extension`
3. Run `npm install`
4. Run `npm run compile`
5. Press F5 to launch Extension Development Host

## Usage

1. Create a new file with `.e+` or `.eplus` extension
2. Start writing E+ code
3. Watch as the validator provides real-time feedback
4. Use quick fixes to improve cognitive clarity

## Example

```eplus
## Simple Task Manager

tasks = []

[add_task] (task) →
    tasks = tasks + [task]
    > "added"

[show_tasks] () →
    repeat item in tasks →
        > item

[main] () →
    repeat forever →
        action = < "add/show/exit"

        ? (action == "add") →
            t = < "task"
            call add_task(t)

        else ? (action == "show") →
            call show_tasks()

        else ? (action == "exit") →
            > "bye"
            return

call main()
```

## Configuration

```json
{
  "eplus.targetLanguage": "python",
  "eplus.maxNestingDepth": 3,
  "eplus.maxOperatorsPerLine": 3
}
```

## License

MIT
