// Utility helpers for E+ Language extension

/**
 * Trims common whitespace and normalizes line endings
 */
export function normalizeSource(source: string): string {
    return source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Counts the number of leading spaces in a line
 */
export function countIndent(line: string): number {
    let count = 0;
    for (const char of line) {
        if (char === ' ') {
            count++;
        } else {
            break;
        }
    }
    return count;
}

/**
 * Extracts the base name from a file path
 */
export function getBasename(path: string): string {
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1].replace(/\.[^.]+$/, '');
}

/**
 * Checks if a string is a valid E+ identifier
 */
export function isValidIdentifier(str: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str);
}

/**
 * Wraps text to a maximum width
 */
export function wrapText(text: string, maxWidth: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= maxWidth) {
            currentLine = (currentLine + ' ' + word).trim();
        } else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.join('\n');
}

/**
 * Debounce function for rate-limiting operations
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | undefined;

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

/**
 * Creates a deep clone of an object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Safely gets a nested property from an object
 */
export function safeGet<T>(obj: Record<string, unknown>, path: string, defaultValue: T): T {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return defaultValue;
        }
        current = (current as Record<string, unknown>)[key];
    }

    return (current as T) ?? defaultValue;
}
