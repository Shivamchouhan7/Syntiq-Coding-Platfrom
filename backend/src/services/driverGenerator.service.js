/**
 * driverGenerator.service.js
 *
 * Generates COMPLETE, runnable source files for a given language by combining:
 *   1. User source code
 *   2. A test driver (main function / entry point)
 *
 * No per-problem wrapper files exist — everything is generated at runtime
 * from the problem's metadata (function_name, return_type, parameters).
 *
 * Supported languages: cpp, java, python, javascript
 *
 * Type mapping:
 *   Abstract type   | C++                 | Java      | Python    | JavaScript
 *   int             | int                 | int       | int       | Number
 *   string          | std::string         | String    | str       | String
 *   bool            | bool                | boolean   | bool      | Boolean
 *   vector<int>     | vector<int>         | int[]     | list[int] | Array
 *   vector<string>  | vector<string>      | String[]  | list[str] | Array
 *   vector<vector<int>> | vector<vector<int>> | int[][] | list[list[int]] | Array
 *
 * Output format for all languages (to match expectedOutput):
 *   int             → plain number, e.g. 3
 *   string          → plain string, no quotes, e.g. hello
 *   bool            → lowercase, e.g. true / false
 *   vector<int>     → [0,1] (no spaces after commas)
 *   vector<string>  → ["foo","bar"] (with quotes per element)
 *   vector<vector<int>> → [[1,2],[3,4]]
 *
 * Input format (testCase.input):
 *   Newline-separated lines. Line i → parameters[i].
 *   Each line is JSON-parseable: numbers, arrays, quoted strings, booleans.
 *   Example for twoSum:
 *     [2,7,11,15]    ← nums (vector<int>)
 *     9              ← target (int)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared input parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses a single raw input line into a JavaScript value.
 * Uses JSON.parse; falls back to the raw trimmed string on failure.
 */
function parseInputLine(rawLine) {
  const trimmed = (rawLine || '').trim();
  if (trimmed === '') return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// C++ helpers
// ─────────────────────────────────────────────────────────────────────────────

function cppTypeOf(abstractType) {
  const map = {
    int: 'int',
    string: 'string',
    bool: 'bool',
    'vector<int>': 'vector<int>',
    'vector<string>': 'vector<string>',
    'vector<vector<int>>': 'vector<vector<int>>',
  };
  return map[abstractType] || 'auto';
}

/**
 * Converts a parsed JS value to its C++ initializer literal string.
 * Handles all types in the type-mapping table.
 */
function toCppLiteral(parsed, abstractType) {
  if (parsed === null || parsed === undefined) {
    if (abstractType === 'int') return '0';
    if (abstractType === 'bool') return 'false';
    if (abstractType === 'string') return '""';
    return '{}';
  }
  switch (abstractType) {
    case 'int':
      return String(parseInt(parsed, 10));
    case 'string': {
      const escaped = String(parsed).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `"${escaped}"`;
    }
    case 'bool':
      return parsed ? 'true' : 'false';
    case 'vector<int>': {
      const arr = Array.isArray(parsed) ? parsed : [];
      return `{${arr.map((v) => parseInt(v, 10)).join(',')}}`;
    }
    case 'vector<string>': {
      const arr = Array.isArray(parsed) ? parsed : [];
      const items = arr
        .map((s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
        .join(',');
      return `{${items}}`;
    }
    case 'vector<vector<int>>': {
      const arr = Array.isArray(parsed) ? parsed : [];
      const inner = arr
        .map((row) => `{${(Array.isArray(row) ? row : []).map((v) => parseInt(v, 10)).join(',')}}`)
        .join(',');
      return `{${inner}}`;
    }
    default:
      return `"${String(parsed)}"`;
  }
}

/**
 * Returns an inline C++ code block that prints `resultVar` in the correct output format.
 * Uses `auto` for the result variable so the caller can use any return type.
 */
function cppPrintCode(returnType, resultVar) {
  switch (returnType) {
    case 'int':
      return `cout << ${resultVar} << "\\n";`;
    case 'string':
      return `cout << ${resultVar} << "\\n";`;
    case 'bool':
      return `cout << (${resultVar} ? "true" : "false") << "\\n";`;
    case 'vector<int>':
      return `{
    cout << "[";
    for (size_t __i = 0; __i < ${resultVar}.size(); ++__i) {
        if (__i > 0) cout << ",";
        cout << ${resultVar}[__i];
    }
    cout << "]\\n";
}`;
    case 'vector<string>':
      return `{
    cout << "[";
    for (size_t __i = 0; __i < ${resultVar}.size(); ++__i) {
        if (__i > 0) cout << ",";
        cout << "\\"" << ${resultVar}[__i] << "\\"";
    }
    cout << "]\\n";
}`;
    case 'vector<vector<int>>':
      return `{
    cout << "[";
    for (size_t __i = 0; __i < ${resultVar}.size(); ++__i) {
        if (__i > 0) cout << ",";
        cout << "[";
        for (size_t __j = 0; __j < ${resultVar}[__i].size(); ++__j) {
            if (__j > 0) cout << ",";
            cout << ${resultVar}[__i][__j];
        }
        cout << "]";
    }
    cout << "]\\n";
}`;
    default:
      return `cout << ${resultVar} << "\\n";`;
  }
}

/**
 * Generates a complete C++ source file.
 * Structure: #include → user Solution class → main()
 */
function generateCppSource(problem, testCase, userCode) {
  const { function_name, return_type, parameters } = problem;
  const inputLines = (testCase.input || '').split('\n');
  const params = parameters || [];

  const declarations = params
    .map((param, i) => {
      const parsed = parseInputLine(inputLines[i]);
      const cppType = cppTypeOf(param.type);
      const literal = toCppLiteral(parsed, param.type);
      return `    ${cppType} ${param.name} = ${literal};`;
    })
    .join('\n');

  const callArgs = params.map((p) => p.name).join(', ');
  const printBlock = cppPrintCode(return_type || 'auto', 'result');

  return `#include <bits/stdc++.h>
using namespace std;

${userCode}

int main() {
    Solution sol;
${declarations}
    auto result = sol.${function_name}(${callArgs});
    ${printBlock}
    return 0;
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Java helpers
// ─────────────────────────────────────────────────────────────────────────────

function javaTypeOf(abstractType) {
  const map = {
    int: 'int',
    string: 'String',
    bool: 'boolean',
    'vector<int>': 'int[]',
    'vector<string>': 'String[]',
    'vector<vector<int>>': 'int[][]',
  };
  return map[abstractType] || 'Object';
}

/**
 * Converts a parsed JS value to a Java new-expression or literal.
 */
function toJavaLiteral(parsed, abstractType) {
  if (parsed === null || parsed === undefined) {
    if (abstractType === 'int') return '0';
    if (abstractType === 'bool') return 'false';
    if (abstractType === 'string') return '""';
    return 'null';
  }
  switch (abstractType) {
    case 'int':
      return String(parseInt(parsed, 10));
    case 'string': {
      const escaped = String(parsed).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `"${escaped}"`;
    }
    case 'bool':
      return parsed ? 'true' : 'false';
    case 'vector<int>': {
      const arr = Array.isArray(parsed) ? parsed : [];
      return `new int[]{${arr.map((v) => parseInt(v, 10)).join(',')}}`;
    }
    case 'vector<string>': {
      const arr = Array.isArray(parsed) ? parsed : [];
      const items = arr
        .map((s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
        .join(',');
      return `new String[]{${items}}`;
    }
    case 'vector<vector<int>>': {
      const arr = Array.isArray(parsed) ? parsed : [];
      const inner = arr
        .map(
          (row) =>
            `new int[]{${(Array.isArray(row) ? row : []).map((v) => parseInt(v, 10)).join(',')}}`
        )
        .join(',');
      return `new int[][]{${inner}}`;
    }
    default:
      return `"${String(parsed)}"`;
  }
}

/**
 * Returns a Java statement that prints `resultVar` in the correct output format.
 * Java's boolean.toString() already produces "true"/"false" (lowercase), so no
 * special handling needed for booleans.
 */
function javaPrintCode(returnType, resultVar) {
  switch (returnType) {
    case 'int':
      return `System.out.println(${resultVar});`;
    case 'string':
      return `System.out.println(${resultVar});`;
    case 'bool':
      // Java Boolean.toString() is already lowercase
      return `System.out.println(${resultVar});`;
    case 'vector<int>':
      return `{
        StringBuilder __sb = new StringBuilder("[");
        for (int __i = 0; __i < ${resultVar}.length; __i++) {
            if (__i > 0) __sb.append(",");
            __sb.append(${resultVar}[__i]);
        }
        __sb.append("]");
        System.out.println(__sb.toString());
    }`;
    case 'vector<string>':
      return `{
        StringBuilder __sb = new StringBuilder("[");
        for (int __i = 0; __i < ${resultVar}.length; __i++) {
            if (__i > 0) __sb.append(",");
            __sb.append("\\"").append(${resultVar}[__i]).append("\\"");
        }
        __sb.append("]");
        System.out.println(__sb.toString());
    }`;
    case 'vector<vector<int>>':
      return `{
        StringBuilder __sb = new StringBuilder("[");
        for (int __i = 0; __i < ${resultVar}.length; __i++) {
            if (__i > 0) __sb.append(",");
            __sb.append("[");
            for (int __j = 0; __j < ${resultVar}[__i].length; __j++) {
                if (__j > 0) __sb.append(",");
                __sb.append(${resultVar}[__i][__j]);
            }
            __sb.append("]");
        }
        __sb.append("]");
        System.out.println(__sb.toString());
    }`;
    default:
      return `System.out.println(${resultVar});`;
  }
}

/**
 * Generates a complete Java source file.
 * Structure: imports → Solution class (non-public) → public class Main
 *
 * Judge0 for Java compiles as Main.java, so the public class MUST be Main.
 * The user's Solution class must NOT be public — this function strips the
 * `public` modifier from `class Solution` automatically.
 */
function generateJavaSource(problem, testCase, userCode) {
  const { function_name, return_type, parameters } = problem;
  const inputLines = (testCase.input || '').split('\n');
  const params = parameters || [];

  // Strip 'public' from Solution class to avoid conflict with public class Main
  const cleanUserCode = userCode.replace(/\bpublic\s+class\s+Solution\b/g, 'class Solution');

  const declarations = params
    .map((param, i) => {
      const parsed = parseInputLine(inputLines[i]);
      const javaType = javaTypeOf(param.type);
      const literal = toJavaLiteral(parsed, param.type);
      return `        ${javaType} ${param.name} = ${literal};`;
    })
    .join('\n');

  const callArgs = params.map((p) => p.name).join(', ');
  const retType = javaTypeOf(return_type);
  const printBlock = javaPrintCode(return_type, 'result');

  return `import java.util.*;
import java.util.stream.*;

${cleanUserCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
${declarations}
        ${retType} result = sol.${function_name}(${callArgs});
        ${printBlock}
    }
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Python helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a parsed JS value to a Python literal string.
 * Python lists are produced via JSON.stringify (JSON array syntax is valid Python).
 * Boolean literals are Python-cased: True / False.
 */
function toPythonLiteral(parsed, abstractType) {
  if (parsed === null || parsed === undefined) {
    if (abstractType === 'int') return '0';
    if (abstractType === 'bool') return 'False';
    if (abstractType === 'string') return '""';
    return '[]';
  }
  switch (abstractType) {
    case 'int':
      return String(parseInt(parsed, 10));
    case 'string':
      return JSON.stringify(String(parsed)); // produces "hello"
    case 'bool':
      return parsed ? 'True' : 'False';
    case 'vector<int>':
    case 'vector<string>':
    case 'vector<vector<int>>':
      // JSON array syntax is valid Python list syntax
      return JSON.stringify(parsed);
    default:
      return JSON.stringify(parsed);
  }
}

/**
 * Returns a Python statement that prints `resultVar` in the correct output format.
 * Uses json.dumps with no-space separators to produce [0,1] not [0, 1].
 */
function pythonPrintCode(returnType, resultVar) {
  switch (returnType) {
    case 'int':
      return `print(${resultVar})`;
    case 'string':
      return `print(${resultVar})`;
    case 'bool':
      // Python prints True/False; we need lowercase true/false
      return `print(str(${resultVar}).lower())`;
    case 'vector<int>':
    case 'vector<string>':
    case 'vector<vector<int>>':
      return `print(__json.dumps(${resultVar}, separators=(',', ':')))`;
    default:
      return `print(${resultVar})`;
  }
}

/**
 * Generates a complete Python source file.
 * Structure: user code → import json → if __name__ == "__main__" block
 */
function generatePythonSource(problem, testCase, userCode) {
  const { function_name, return_type, parameters } = problem;
  const inputLines = (testCase.input || '').split('\n');
  const params = parameters || [];

  const assignments = params
    .map((param, i) => {
      const parsed = parseInputLine(inputLines[i]);
      const literal = toPythonLiteral(parsed, param.type);
      return `    ${param.name} = ${literal}`;
    })
    .join('\n');

  const callArgs = params.map((p) => p.name).join(', ');
  const printLine = pythonPrintCode(return_type, 'result');

  return `${userCode}

import json as __json

if __name__ == "__main__":
    sol = Solution()
${assignments}
    result = sol.${function_name}(${callArgs})
    ${printLine}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// JavaScript helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a parsed JS value to a JavaScript literal expression string.
 * Booleans are explicitly lowercased; all others use JSON.stringify.
 */
function toJsLiteral(parsed, abstractType) {
  if (parsed === null || parsed === undefined) {
    if (abstractType === 'int') return '0';
    if (abstractType === 'bool') return 'false';
    if (abstractType === 'string') return '""';
    return '[]';
  }
  switch (abstractType) {
    case 'bool':
      return parsed ? 'true' : 'false';
    default:
      return JSON.stringify(parsed);
  }
}

/**
 * Returns a JavaScript statement that prints `resultVar` to stdout.
 * Uses JSON.stringify for arrays to produce [0,1] not the default Array.toString().
 */
function jsPrintCode(returnType, resultVar) {
  switch (returnType) {
    case 'int':
      return `console.log(${resultVar});`;
    case 'string':
      return `console.log(${resultVar});`;
    case 'bool':
      return `console.log(${resultVar} ? "true" : "false");`;
    case 'vector<int>':
    case 'vector<string>':
    case 'vector<vector<int>>':
      return `console.log(JSON.stringify(${resultVar}));`;
    default:
      // Fallback: use JSON.stringify for unknown types
      return `console.log(typeof ${resultVar} === 'object' ? JSON.stringify(${resultVar}) : String(${resultVar}));`;
  }
}

/**
 * Generates a complete JavaScript source file.
 * Structure: user function(s) → hardcoded variable declarations → call → print
 *
 * In JavaScript, LeetCode-style functions are standalone (not class methods),
 * so we call the function directly by name.
 */
function generateJsSource(problem, testCase, userCode) {
  const { function_name, return_type, parameters } = problem;
  const inputLines = (testCase.input || '').split('\n');
  const params = parameters || [];

  const declarations = params
    .map((param, i) => {
      const parsed = parseInputLine(inputLines[i]);
      const literal = toJsLiteral(parsed, param.type);
      return `const ${param.name} = ${literal};`;
    })
    .join('\n');

  const callArgs = params.map((p) => p.name).join(', ');
  const printLine = jsPrintCode(return_type, 'result');

  return `${userCode}

// ─── Syntiq Test Driver ───
${declarations}
const result = ${function_name}(${callArgs});
${printLine}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a complete, runnable source file for the given language and test case.
 *
 * @param {string} language - 'cpp' | 'java' | 'python' | 'javascript' (case-insensitive)
 * @param {object} problem - Problem metadata from Supabase, must contain:
 *   - function_name {string}
 *   - return_type {string}
 *   - parameters {Array<{ name: string, type: string }>}
 * @param {{ input: string, expectedOutput: string }} testCase - Test case
 * @param {string} userCode - Raw source code submitted by the user
 * @returns {string} Complete, compilable/runnable source file
 * @throws {Error} If the language is not one of the 4 supported values
 */
export function generateDriver(language, problem, testCase, userCode) {
  if (!language || typeof language !== 'string') {
    throw new Error('generateDriver: language must be a non-empty string');
  }
  if (!userCode || typeof userCode !== 'string') {
    throw new Error('generateDriver: userCode must be a non-empty string');
  }

  switch (language.toLowerCase()) {
    case 'cpp':
      return generateCppSource(problem, testCase, userCode);
    case 'java':
      return generateJavaSource(problem, testCase, userCode);
    case 'python':
      return generatePythonSource(problem, testCase, userCode);
    case 'javascript':
      return generateJsSource(problem, testCase, userCode);
    default:
      throw new Error(
        `generateDriver: unsupported language "${language}". Supported: cpp, java, python, javascript`
      );
  }
}
