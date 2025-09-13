/**
 * Code structure analysis utilities
 */

import type { ClassInfo, FunctionInfo } from '@unified-repo-analyzer/shared/src/types/repository';

/**
 * Result of code structure analysis
 */
export interface CodeStructureAnalysis {
  /**
   * Detected functions
   */
  functions: FunctionInfo[];

  /**
   * Detected classes
   */
  classes: ClassInfo[];

  /**
   * Number of import statements
   */
  importCount: number;
}

/**
 * Regular expressions for detecting code structures
 */
const STRUCTURE_PATTERNS = {
  // JavaScript/TypeScript patterns
  javascript: {
    // Function declarations: function name(...) or name = function(...) or name: function(...)
    function:
      /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*function|(?:async\s+)?(?:function)?\s*(\w+)\s*\([^)]*\)\s*=>|(\w+)\s*:\s*function)/g,

    // Arrow functions with name: const name = (...) =>
    arrowFunction: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]+)\s*=>/g,

    // Class declarations: class Name or export class Name
    class: /(?:export\s+)?class\s+(\w+)/g,

    // Import statements
    import: /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from|import\s+[^;]+;/g,
  },

  // Python patterns
  python: {
    // Function declarations: def name(...)
    function: /def\s+(\w+)\s*\(/g,

    // Class declarations: class Name
    class: /class\s+(\w+)(?:\(|:)/g,

    // Import statements
    import: /(?:import|from)\s+[\w.]+\s+(?:import|as)/g,
  },

  // Java patterns
  java: {
    // Method declarations: public void name(...) or private String name(...)
    function:
      /(?:public|private|protected|static|\s) +[\w<>[\]]+\s+(\w+) *\([^)]*\) *(?:{|throws)/g,

    // Class declarations: public class Name or class Name
    class: /(?:public|private|protected|static|\s) +class +(\w+)/g,

    // Import statements
    import: /import\s+[\w.]+(?:\.\*)?;/g,
  },

  // C# patterns
  csharp: {
    // Method declarations: public void Name(...) or private string Name(...)
    function:
      /(?:public|private|protected|internal|static|\s) +[\w<>[\]]+\s+(\w+) *\([^)]*\) *(?:{|=>)/g,

    // Class declarations: public class Name or class Name
    class: /(?:public|private|protected|internal|static|\s) +class +(\w+)/g,

    // Import statements (using directives)
    import: /using\s+[\w.]+;/g,
  },

  // Go patterns
  go: {
    // Function declarations: func Name(...) or func (receiver) Name(...)
    function: /func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(/g,

    // Struct declarations (Go's version of classes)
    class: /type\s+(\w+)\s+struct/g,

    // Import statements
    import: /import\s+(?:"[^"]+"|(?:\([^)]+\)))/g,
  },

  // Ruby patterns
  ruby: {
    // Method declarations: def name or def self.name
    function: /def\s+(?:self\.)?(\w+)/g,

    // Class declarations: class Name
    class: /class\s+(\w+)/g,

    // Import statements (require)
    import: /require\s+['"][^'"]+['"]/g,
  },

  // PHP patterns
  php: {
    // Function declarations: function name(...) or public function name(...)
    function: /(?:public|private|protected|static|\s)*function\s+(\w+)\s*\(/g,

    // Class declarations: class Name or abstract class Name
    class: /(?:abstract\s+)?class\s+(\w+)/g,

    // Import statements (use statements)
    import: /use\s+[\w\\]+(?:\s+as\s+\w+)?;/g,
  },

  // Rust patterns
  rust: {
    // Function declarations: fn name(...) or pub fn name(...)
    function: /(?:pub\s+)?fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(/g,

    // Struct/trait declarations (Rust's version of classes)
    class: /(?:pub\s+)?(?:struct|trait|enum)\s+(\w+)/g,

    // Import statements (use statements)
    import: /use\s+[\w:]+(?:::\{[^}]*\})?;/g,
  },

  // Swift patterns
  swift: {
    // Function declarations: func name(...) or public func name(...)
    function: /(?:public|private|internal|fileprivate|open|\s)*func\s+(\w+)\s*(?:<[^>]*>)?\s*\(/g,

    // Class declarations: class Name or public class Name
    class: /(?:public|private|internal|fileprivate|open|\s)*class\s+(\w+)/g,

    // Import statements
    import: /import\s+\w+/g,
  },

  // Kotlin patterns
  kotlin: {
    // Function declarations: fun name(...) or public fun name(...)
    function: /(?:public|private|protected|internal|inline|\s)*fun\s+(\w+)\s*(?:<[^>]*>)?\s*\(/g,

    // Class declarations: class Name or data class Name
    class: /(?:public|private|protected|internal|\s)*(?:data\s+)?class\s+(\w+)/g,

    // Import statements
    import: /import\s+[\w.]+(?:\.\*)?/g,
  },

  // Generic patterns for other languages
  generic: {
    // Generic function pattern (simple)
    function: /(?:function|func|def|fn|method|procedure)\s+(\w+)\s*\(/g,

    // Generic class pattern (simple)
    class: /(?:class|struct|interface|trait|enum)\s+(\w+)/g,

    // Generic import pattern (simple)
    import: /(?:import|include|require|use|using)\s+[\w."']+/g,
  },
};

/**
 * Analyzes code structure to detect functions, classes, and imports
 *
 * @param content - File content
 * @param language - Programming language
 * @returns Code structure analysis
 */
export function analyzeCodeStructure(content: string, language: string): CodeStructureAnalysis {
  // Initialize result
  const result: CodeStructureAnalysis = {
    functions: [],
    classes: [],
    importCount: 0,
  };

  // Get patterns for the language
  const patterns = getLanguagePatterns(language);

  // Split content into lines for line number tracking
  const _lines = content.split('\n');

  // Find functions
  const functionMatches = new Set<string>();

  // Reset regex lastIndex
  patterns.function.lastIndex = 0;

  {
    let match: RegExpExecArray | null;
    while ((match = patterns.function.exec(content)) !== null) {
      // Find the first non-null capturing group (function name)
      const name = match.slice(1).find((group) => group !== undefined);

      if (name && !functionMatches.has(name)) {
        functionMatches.add(name);

        // Find line number
        const lineNumber = getLineNumber(content, match.index);

        // Add function info
        result.functions.push({
          name,
          lineNumber,
          parameters: [], // Parameter extraction would require more complex parsing
        });
      }
    }
  }

  // For JavaScript/TypeScript, also check for arrow functions
  if ((language === 'JavaScript' || language === 'TypeScript') && patterns.arrowFunction) {
    patterns.arrowFunction.lastIndex = 0;

    {
      let match: RegExpExecArray | null;
      while ((match = patterns.arrowFunction.exec(content)) !== null) {
        const name = match[1];

        if (name && !functionMatches.has(name)) {
          functionMatches.add(name);

          // Find line number
          const lineNumber = getLineNumber(content, match.index);

          // Add function info
          result.functions.push({
            name,
            lineNumber,
            parameters: [],
          });
        }
      }
    }
  }

  // Find classes
  patterns.class.lastIndex = 0;

  {
    let match: RegExpExecArray | null;
    while ((match = patterns.class.exec(content)) !== null) {
      const name = match[1];

      if (name) {
        // Find line number
        const lineNumber = getLineNumber(content, match.index);

        // Add class info
        result.classes.push({
          name,
          lineNumber,
          methods: [], // Method extraction would require more complex parsing
        });
      }
    }
  }

  // Count imports
  patterns.import.lastIndex = 0;

  {
    let match: RegExpExecArray | null;
    while ((match = patterns.import.exec(content)) !== null) {
      result.importCount++;
    }
  }

  return result;
}

/**
 * Gets regex patterns for a specific language
 *
 * @param language - Programming language
 * @returns Object with regex patterns
 */
function getLanguagePatterns(language: string): {
  function: RegExp;
  class: RegExp;
  import: RegExp;
  arrowFunction?: RegExp;
} {
  // Normalize language name
  const normalizedLanguage = language.toLowerCase();

  // Map language to pattern key
  let patternKey: keyof typeof STRUCTURE_PATTERNS;

  switch (normalizedLanguage) {
    case 'javascript':
    case 'typescript':
    case 'jsx':
    case 'tsx':
      patternKey = 'javascript';
      break;

    case 'python':
      patternKey = 'python';
      break;

    case 'java':
      patternKey = 'java';
      break;

    case 'c#':
    case 'csharp':
      patternKey = 'csharp';
      break;

    case 'go':
      patternKey = 'go';
      break;

    case 'ruby':
      patternKey = 'ruby';
      break;

    case 'php':
      patternKey = 'php';
      break;

    case 'rust':
      patternKey = 'rust';
      break;

    case 'swift':
      patternKey = 'swift';
      break;

    case 'kotlin':
      patternKey = 'kotlin';
      break;

    default:
      patternKey = 'generic';
  }

  // Clone the patterns to avoid modifying the originals
  return {
    function: new RegExp(STRUCTURE_PATTERNS[patternKey].function.source, 'g'),
    class: new RegExp(STRUCTURE_PATTERNS[patternKey].class.source, 'g'),
    import: new RegExp(STRUCTURE_PATTERNS[patternKey].import.source, 'g'),
    ...(patternKey === 'javascript' && {
      arrowFunction: new RegExp(STRUCTURE_PATTERNS.javascript.arrowFunction.source, 'g'),
    }),
  };
}

/**
 * Gets line number for a position in text
 *
 * @param text - Text content
 * @param position - Character position
 * @returns Line number (1-based)
 */
function getLineNumber(text: string, position: number): number {
  // Count newlines before the position
  const textBefore = text.substring(0, position);
  const lines = textBefore.split('\n');
  return lines.length;
}
