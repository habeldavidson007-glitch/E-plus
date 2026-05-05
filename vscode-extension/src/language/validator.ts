// Cognitive Validator for E+ Language
// Enforces human-thought-aligned constraints

import * as AST from './ast';

export enum IssueSeverity {
  Error = 'error',
  Warning = 'warning'
}

export interface CognitiveIssue {
  message: string;
  line?: number;
  column?: number;
  severity: IssueSeverity;
  ruleNumber: number;
  suggestion?: string;
}

export interface ValidationResult {
  issues: CognitiveIssue[];
  isValid: boolean;
  score: number; // 0-100 cognitive complexity score
}

export interface ValidatorConfig {
  maxIdentifiersPerLine: number;
  maxLogicalOperators: number;
  maxFunctionParameters: number;
  maxFunctionArguments: number;
  maxNestingDepth: number;
}

const DEFAULT_CONFIG: ValidatorConfig = {
  maxIdentifiersPerLine: 3,
  maxLogicalOperators: 2,
  maxFunctionParameters: 3,
  maxFunctionArguments: 3,
  maxNestingDepth: 3
};

export function validate(ast: AST.Program, config: Partial<ValidatorConfig> = {}): ValidationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const issues: CognitiveIssue[] = [];

  // Validate each statement with nesting depth tracking
  for (const stmt of ast.statements) {
    validateStatementInternal(stmt, issues, finalConfig, 0);
  }

  // Calculate cognitive score
  const score = calculateCognitiveScore(ast, issues);

  return {
    issues,
    isValid: issues.filter(i => i.severity === IssueSeverity.Error).length === 0,
    score
  };
}

function validateStatement(
  validatorFn: (stmt: AST.Statement) => void,
  statements: AST.Statement[]
): void {
  for (const stmt of statements) {
    validatorFn(stmt);
  }
}

function validateStatementInternal(
  stmt: AST.Statement,
  issues: CognitiveIssue[],
  config: ValidatorConfig,
  depth: number
): void {
  // Check nesting depth
  if (depth > config.maxNestingDepth) {
    issues.push({
      message: `Nesting depth exceeds limit (${depth} > ${config.maxNestingDepth}). Flatten your logic.`,
      line: stmt.line,
      severity: IssueSeverity.Warning,
      ruleNumber: 4,
      suggestion: 'Break this into smaller functions or use early returns'
    });
  }

  switch (stmt.type) {
    case 'Assignment':
      validateExpression(stmt.expression, stmt.line, 'assignment', issues, config, 1);
      break;

    case 'Input':
      // Input statements are always valid
      break;

    case 'Output':
      validateExpression(stmt.expression, stmt.line, 'output', issues, config, 5);
      break;

    case 'Condition':
      validateCondition(stmt.condition, stmt.line, issues, config);
      validateBlock(stmt.block, issues, config, depth + 1);
      break;

    case 'ElseIf':
      validateCondition(stmt.condition, stmt.line, issues, config);
      validateBlock(stmt.block, issues, config, depth + 1);
      break;

    case 'Else':
      validateBlock(stmt.block, issues, config, depth + 1);
      break;

    case 'Repeat':
      validateBlock(stmt.block, issues, config, depth + 1);
      if (stmt.iterable) {
        validateExpression(stmt.iterable, stmt.line, 'repeat iterable', issues, config, 7);
      }
      break;

    case 'FunctionDef':
      // Check parameter count
      if (stmt.parameters.length > config.maxFunctionParameters) {
        issues.push({
          message: `Too many parameters (${stmt.parameters.length} > ${config.maxFunctionParameters}). Consider splitting into smaller functions.`,
          line: stmt.line,
          severity: IssueSeverity.Warning,
          ruleNumber: 3,
          suggestion: 'Split this function into multiple functions with fewer parameters'
        });
      }
      validateBlock(stmt.block, issues, config, depth + 1);
      break;

    case 'FunctionCall':
      // Check argument count
      if (stmt.arguments.length > config.maxFunctionArguments) {
        issues.push({
          message: `Too many arguments (${stmt.arguments.length} > ${config.maxFunctionArguments}). Consider using an object or splitting the call.`,
          line: stmt.line,
          severity: IssueSeverity.Warning,
          ruleNumber: 3,
          suggestion: 'Group related arguments or split into multiple calls'
        });
      }
      for (const arg of stmt.arguments) {
        validateExpression(arg, stmt.line, 'function argument', issues, config, 3);
      }
      break;

    case 'Return':
      validateExpression(stmt.expression, stmt.line, 'return', issues, config, 3);
      break;

    case 'SysCall':
      // Mark sys as unsafe bypass
      issues.push({
        message: `sys call detected (unsafe bypass): ${stmt.expression}`,
        line: stmt.line,
        severity: IssueSeverity.Warning,
        ruleNumber: 5,
        suggestion: 'sys bypasses cognitive validation - ensure this is necessary'
      });
      break;

    case 'Remove':
      // Remove statements are always valid
      break;

    case 'Comment':
      // Comments are always valid
      break;
  }
}

function calculateCognitiveScore(ast: AST.Program, issues: CognitiveIssue[]): number {
  const baseScore = 100;
  const warningPenalty = 5;
  const errorPenalty = 15;
  
  const warnings = issues.filter(i => i.severity === IssueSeverity.Warning).length;
  const errors = issues.filter(i => i.severity === IssueSeverity.Error).length;
  
  const penalty = (warnings * warningPenalty) + (errors * errorPenalty);
  return Math.max(0, baseScore - penalty);
}

function validateBlock(block: AST.Block, issues: CognitiveIssue[], config: ValidatorConfig, depth: number = 0): void {
  for (const stmt of block.statements) {
    validateStatementInternal(stmt, issues, config, depth);
  }
}

function validateExpression(
  expr: string,
  line: number | undefined,
  context: string,
  issues: CognitiveIssue[],
  config: ValidatorConfig,
  ruleNumber: number
): void {
  // Count unique identifiers
  const identifiers = extractIdentifiers(expr);
  if (identifiers.length > config.maxIdentifiersPerLine) {
    issues.push({
      message: `Too many entities (${identifiers.length} > ${config.maxIdentifiersPerLine}) in ${context}. Split into separate steps.`,
      line,
      severity: IssueSeverity.Warning,
      ruleNumber: 2,
      suggestion: 'Break this into multiple lines, one thought per line'
    });
  }

  // Count logical operators
  const logicalOps = countLogicalOperators(expr);
  if (logicalOps > config.maxLogicalOperators) {
    issues.push({
      message: `Too many logical operators (${logicalOps} > ${config.maxLogicalOperators}) in ${context}. Split condition.`,
      line,
      severity: IssueSeverity.Warning,
      ruleNumber: ruleNumber,
      suggestion: 'Split this condition into multiple sequential checks'
    });
  }

  // Count math operators for expression density check
  const mathOps = countMathOperators(expr);
  if (mathOps > 3) {
    issues.push({
      message: `Expression too dense (${mathOps} operators). Consider intermediate variables.`,
      line,
      severity: IssueSeverity.Warning,
      ruleNumber: 1,
      suggestion: 'Break complex expressions into named intermediate steps for clarity'
    });
  }
}

function countMathOperators(expr: string): number {
  // Count: +, -, *, / (but not -> arrow)
  const cleanedExpr = expr.replace(/->/g, '');
  const plusCount = (cleanedExpr.match(/\+/g) || []).length;
  const minusCount = (cleanedExpr.match(/-(?!=)/g) || []).length;
  const mulCount = (cleanedExpr.match(/\*/g) || []).length;
  const divCount = (cleanedExpr.match(/\//g) || []).length;
  return plusCount + minusCount + mulCount + divCount;
}

function validateCondition(
  condition: string,
  line: number | undefined,
  issues: CognitiveIssue[],
  config: ValidatorConfig
): void {
  validateExpression(condition, line, 'condition', issues, config, 3);
}

function extractIdentifiers(expr: string): string[] {
  // Match identifiers (variable names) - exclude keywords and numbers
  const keywordSet = new Set([
    'true', 'false', 'and', 'or', 'not', 'in', 'call', 'return', 'remove', 'repeat', 'else'
  ]);

  const identifierRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
  const matches = expr.match(identifierRegex) || [];

  // Filter out keywords and pure numbers
  return matches.filter(id => !keywordSet.has(id.toLowerCase()) && !/^\d+$/.test(id));
}

function countLogicalOperators(expr: string): number {
  // Count: and, or, &&, ||
  const andCount = (expr.match(/\band\b|&&/g) || []).length;
  const orCount = (expr.match(/\bor\b|\|\|/g) || []).length;
  return andCount + orCount;
}

// Export a simpler validate function for direct use
export function validateWithDefaults(ast: AST.Program): ValidationResult {
  return validate(ast, DEFAULT_CONFIG);
}
