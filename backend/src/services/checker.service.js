/**
 * checker.service.js
 *
 * Compares program output against expected output using normalized string comparison.
 *
 * Normalization rules (applied to BOTH sides before comparing):
 *   1. Convert to string
 *   2. Normalize line endings: \r\n and \r → \n
 *   3. Trim leading and trailing whitespace
 *   4. Collapse runs of 2 or more consecutive spaces into a single space
 *   5. Strip trailing newlines
 *
 * Comparison is CASE-SENSITIVE. Neither side is lowercased.
 */

/**
 * Normalizes a string for output comparison.
 * @param {string|null|undefined} value
 * @returns {string}
 */
function normalize(value) {
  if (value === null || value === undefined) return '';

  return (
    String(value)
      // Step 2: normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Step 3 + 4: trim and collapse spaces
      .replace(/ {2,}/g, ' ')
      .trim()
      // Step 5: strip trailing newlines (after trim, any remaining trailing \n)
      .replace(/\n+$/, '')
  );
}

/**
 * Compares the actual program stdout against the expected output string.
 *
 * Both sides are normalized before comparison.
 * The comparison is case-sensitive.
 *
 * @param {string} actual - Raw stdout string from Judge0 (base64-decoded)
 * @param {string} expected - Expected output string from the test case
 * @returns {boolean} true if outputs match after normalization, false otherwise
 *
 * @example
 * compareOutputs("1  2  3\n", "1 2 3")   // → true
 * compareOutputs("[0,1]\n",   "[0,1]")   // → true
 * compareOutputs("True",      "true")    // → false (case-sensitive)
 */
export function compareOutputs(actual, expected) {
  return normalize(actual) === normalize(expected);
}
