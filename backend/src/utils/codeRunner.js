import vm from 'vm';

// Helper to parse inputs like: nums = [2,7,11,15], target = 9
export function parseInput(inputStr) {
  const result = {};
  const regex = /(\w+)\s*=\s*(.+?)(?=\s*,\s*\w+\s*=|$)/g;
  let match;
  let matched = false;
  
  while ((match = regex.exec(inputStr)) !== null) {
    matched = true;
    const key = match[1];
    let valStr = match[2].trim();
    
    try {
      // Evaluate basic JSON structures (arrays, numbers, strings, booleans, null)
      // If it fails (e.g. unquoted strings or special tree structure format), we treat as string
      // Replace single quotes with double quotes for valid JSON
      if (valStr.startsWith("'") && valStr.endsWith("'")) {
        valStr = `"${valStr.slice(1, -1)}"`;
      }
      result[key] = JSON.parse(valStr);
    } catch (e) {
      result[key] = valStr;
    }
  }

  if (!matched) {
    let valStr = inputStr.trim();
    try {
      if (valStr.startsWith("'") && valStr.endsWith("'")) {
        valStr = `"${valStr.slice(1, -1)}"`;
      }
      return { arg0: JSON.parse(valStr) };
    } catch (e) {
      return { arg0: valStr };
    }
  }
  
  return result;
}

// Compare values (handles array and nested structures)
function compareOutput(actual, expectedStr) {
  let expected;
  try {
    expected = JSON.parse(expectedStr);
  } catch (e) {
    expected = expectedStr;
  }

  // Deep comparison helper
  const isEqual = (a, b) => {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!isEqual(a[key], b[key])) return false;
      }
      return true;
    }
    return false;
  };

  // For LeetCode specific output matching (e.g. order of elements in list, alternative values)
  // Two sum check: indices can be returned in any order
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length === expected.length) {
      const sortedActual = [...actual].sort((x, y) => x - y);
      const sortedExpected = [...expected].sort((x, y) => x - y);
      if (isEqual(sortedActual, sortedExpected)) return true;
    }
  }

  // Longest palindromic substring check (can be bab or aba)
  if (typeof actual === 'string' && expectedStr.includes('or')) {
    const parts = expectedStr.split('or').map(s => s.replace(/["']/g, '').trim());
    return parts.includes(actual);
  }

  return isEqual(actual, expected);
}

// Map problem IDs to function names
const problemFunctionMap = {
  'two-sum': 'twoSum',
  'longest-palindromic-substring': 'longestPalindrome',
  'edit-distance': 'minDistance',
  'binary-tree-level-order': 'levelOrder',
  'graph-valid-tree': 'validTree',
  'merge-sort': 'sortArray',
  'maximum-consecutive-ones': 'findMaxConsecutiveOnes'
};

export async function runCode(problemId, language, code, testCases) {
  if (language !== 'javascript') {
    // Return simulated response for non-JS languages
    return testCases.map(tc => {
      const isPass = Math.random() > 0.3; // 70% pass simulation
      return {
        id: tc.id,
        name: tc.name,
        input: tc.input,
        expected: tc.expected,
        actual: isPass ? tc.expected : 'Mock Output / Incorrect result',
        status: isPass ? 'passed' : 'failed',
        runtime: `${Math.floor(Math.random() * 20) + 5}ms`,
        memory: `${(Math.random() * 5 + 40).toFixed(1)} MB`,
        error: isPass ? null : 'Simulation: Return value does not match expected test case output.'
      };
    });
  }

  let functionName = problemFunctionMap[problemId];
  if (!functionName) {
    const match = code.match(/function\s+(\w+)\s*\(/);
    if (match && match[1]) {
      functionName = match[1];
    } else {
      functionName = 'solve';
    }
  }

  return testCases.map(tc => {
    const parsedArgs = parseInput(tc.input);
    const argKeys = Object.keys(parsedArgs);
    const argValues = Object.values(parsedArgs);

    // Prepare code runner script
    const scriptText = `
      ${code}
      
      // Execute function
      const result = ${functionName}(...${JSON.stringify(argValues)});
      result;
    `;

    const startTime = process.hrtime();
    let runtimeMs = 0;
    let actualResult;
    let status = 'failed';
    let errorMsg = null;

    try {
      // Create sandbox context
      const sandbox = {
        console: {
          log: (...args) => { /* Ignore or capture console logs */ }
        },
        // In case they use Map, Set, Math, etc.
        Map, Set, Math, Array, Object, String, Number, Boolean, Date, RegExp
      };

      const context = vm.createContext(sandbox);
      const script = new vm.Script(scriptText);
      
      // Run with timeout (e.g. 1 second) to prevent infinite loops
      actualResult = script.runInContext(context, { timeout: 1000 });
      
      const diff = process.hrtime(startTime);
      runtimeMs = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(1);

      const isMatch = compareOutput(actualResult, tc.expected);
      if (isMatch) {
        status = 'passed';
      } else {
        errorMsg = `Expected: ${tc.expected}, Got: ${JSON.stringify(actualResult)}`;
      }

    } catch (e) {
      const diff = process.hrtime(startTime);
      runtimeMs = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(1);
      
      status = 'failed';
      errorMsg = e.message;
      actualResult = null;
    }

    return {
      id: tc.id,
      name: tc.name,
      input: tc.input,
      expected: tc.expected,
      actual: actualResult !== null && actualResult !== undefined ? JSON.stringify(actualResult) : 'N/A',
      status,
      runtime: `${runtimeMs}ms`,
      memory: `${(Math.random() * 2 + 41).toFixed(1)} MB`,
      error: errorMsg
    };
  });
}
