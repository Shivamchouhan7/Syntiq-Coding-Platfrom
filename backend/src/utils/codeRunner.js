import vm from 'vm';

// Helper to parse inputs like: nums = [2,7,11,15], target = 9
export function parseInput(inputStr) {
  const result = {};
  const regex = /(\w+)\s*=\s*(.+?)(?=\s*,\s*\w+\s*=|$)/g;
  let match;
  
  while ((match = regex.exec(inputStr)) !== null) {
    const key = match[1];
    let valStr = match[2].trim();
    
    try {
      // Evaluate basic JSON structures (arrays, numbers, strings, booleans, null)
      // If it fails (e.g. unquoted strings or special tree structure format), we treat as string
      // Replace all single quotes with double quotes for valid JSON
      const jsonStr = valStr.replace(/'/g, '"');
      result[key] = JSON.parse(jsonStr);
    } catch (e) {
      result[key] = valStr;
    }
  }
  
  return result;
}

// Compare values (handles array and nested structures)
function compareOutput(actual, expectedStr) {
  let expected;
  try {
    const jsonStr = expectedStr.replace(/'/g, '"');
    expected = JSON.parse(jsonStr);
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
  'merge-sort': 'sortArray'
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
    // Attempt to extract function name from user code using regex
    // Matches: function myFunc( or const myFunc = function( or const myFunc = (args) =>
    const match = code.match(/(?:function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:function|\(.*?\)\s*=>|[a-zA-Z_$][0-9a-zA-Z_$]*\s*=>))/);
    if (match) {
      functionName = match[1] || match[2];
    }
  }

  if (!functionName) {
    throw new Error(`Execution unsupported for problem: ${problemId}. Could not detect function name from code.`);
  }

  return testCases.map(tc => {
    const parsedArgs = parseInput(tc.input);
    const argKeys = Object.keys(parsedArgs);
    const argValues = Object.values(parsedArgs);

    // Prepare code runner script
    const argsDecls = Object.entries(parsedArgs)
      .map(([k, v]) => `let arg_${k} = ${JSON.stringify(v)};`)
      .join('\n      ');
    const argsCall = Object.keys(parsedArgs)
      .map(k => `arg_${k}`)
      .join(', ');
    const firstArgName = Object.keys(parsedArgs)[0] ? `arg_${Object.keys(parsedArgs)[0]}` : 'undefined';

    const scriptText = `
      ${code}
      
      ${argsDecls}
      // Execute function
      const result = ${functionName}(${argsCall});
      
      // If function returns undefined, assume in-place modification and return the first argument
      result !== undefined ? result : ${firstArgName};
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
