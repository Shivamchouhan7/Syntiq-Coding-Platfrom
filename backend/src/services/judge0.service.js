/**
 * judge0.service.js
 *
 * Handles all communication with the Judge0 API on RapidAPI.
 * Responsibilities:
 *   - submitCode: POST source code to Judge0, return token
 *   - pollSubmission: poll every 1000ms until terminal status, timeout at 15s
 *   - getFinalResult: decode base64 outputs and map status to Syntiq verdict
 *
 * Security guarantees:
 *   - cpu_time_limit, wall_time_limit, memory_limit are HARDCODED and never user-overridable
 *   - Source code is always base64-encoded before transmission
 *   - RapidAPI headers are always attached
 */

const JUDGE0_BASE = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';

// Judge0 language IDs used by Syntiq.
// These are the authoritative language IDs for this project.
export const LANGUAGE_IDS = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
};

// Maps Judge0 status IDs to Syntiq verdict strings.
const STATUS_MAP = {
  3: 'ACCEPTED',
  4: 'WRONG_ANSWER',
  5: 'TIME_LIMIT_EXCEEDED',
  6: 'COMPILATION_ERROR',
  7: 'RUNTIME_ERROR',
  8: 'RUNTIME_ERROR',
  9: 'RUNTIME_ERROR',
  10: 'RUNTIME_ERROR',
  11: 'RUNTIME_ERROR',
  12: 'MEMORY_LIMIT_EXCEEDED',
};

/**
 * Returns the headers for every Judge0 request.
 * If running against RapidAPI, includes RapidAPI headers.
 * If running locally, supports optional authorization.
 */
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  const isRapidApi = JUDGE0_BASE.includes('rapidapi.com');
  if (isRapidApi) {
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY || '';
  } else if (process.env.JUDGE0_API_KEY) {
    // Standard Judge0 authentication header if configured locally
    headers['X-Auth-Token'] = process.env.JUDGE0_API_KEY;
  }

  return headers;
}

/**
 * Safely decodes a base64 string from Judge0.
 * Returns an empty string for null, undefined, or non-string input.
 */
function decodeBase64(encoded) {
  if (!encoded || typeof encoded !== 'string') return '';
  try {
    return Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

/**
 * Promise-based sleep for polling.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Submits source code to Judge0 via RapidAPI.
 *
 * Source code is base64-encoded before sending.
 * Security limits are hardcoded and cannot be overridden by any caller.
 *
 * @param {string} sourceCode - The complete runnable source (user code + generated driver)
 * @param {number} languageId - Judge0 language ID (from LANGUAGE_IDS)
 * @returns {Promise<string>} The Judge0 submission token
 * @throws {Error} If the HTTP request fails or Judge0 does not return a token
 */
export async function submitCode(sourceCode, languageId) {
  const payload = {
    source_code: Buffer.from(sourceCode, 'utf8').toString('base64'),
    language_id: languageId,
    // ─── HARDCODED SECURITY LIMITS — DO NOT ALLOW USER OVERRIDE ───
    cpu_time_limit: 2,
    wall_time_limit: 5,
    memory_limit: 128000,
    // ──────────────────────────────────────────────────────────────
  };

  let response;
  try {
    response = await fetch(
      `${JUDGE0_BASE}/submissions?base64_encoded=true&wait=false`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );
  } catch (networkErr) {
    throw new Error(`Judge0 network error during submission: ${networkErr.message}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Judge0 submission failed: HTTP ${response.status} ${response.statusText} — ${body}`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Judge0 returned a non-JSON response during submission.');
  }

  if (!data.token) {
    throw new Error(
      `Judge0 did not return a submission token. Full response: ${JSON.stringify(data)}`
    );
  }

  return data.token;
}

/**
 * Polls Judge0 for a submission's result until a terminal status is reached.
 *
 * - Polls every 1000ms
 * - Gives up after 15000ms and returns a synthetic INTERNAL_ERROR sentinel object
 * - Status IDs 1 (In Queue) and 2 (Processing) are non-terminal; all others are terminal
 *
 * @param {string} token - The Judge0 submission token from submitCode
 * @returns {Promise<object>} Raw Judge0 submission data object
 * @throws {Error} If an HTTP request fails during polling
 */
export async function pollSubmission(token) {
  const POLL_INTERVAL_MS = 1000;
  const TIMEOUT_MS = 15000;
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    let response;
    try {
      response = await fetch(
        `${JUDGE0_BASE}/submissions/${encodeURIComponent(token)}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time,memory`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );
    } catch (networkErr) {
      throw new Error(`Judge0 network error during polling: ${networkErr.message}`);
    }

    if (!response.ok) {
      throw new Error(
        `Judge0 poll request failed: HTTP ${response.status} ${response.statusText}`
      );
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Judge0 returned a non-JSON response during polling.');
    }

    const statusId = data?.status?.id;

    // Status IDs 1 and 2 are non-terminal (In Queue / Processing); anything > 2 is final.
    if (typeof statusId === 'number' && statusId > 2) {
      return data;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  // 15-second timeout reached — return a synthetic INTERNAL_ERROR sentinel
  return {
    status: { id: 13, description: 'Internal Error — Syntiq polling timeout (15s)' },
    stdout: null,
    stderr: null,
    compile_output: null,
    time: null,
    memory: null,
  };
}

/**
 * Extracts a structured, human-readable result from a raw Judge0 submission object.
 * Decodes all base64-encoded output fields.
 *
 * @param {object} submissionData - Raw Judge0 response object from pollSubmission
 * @returns {{
 *   verdict: string,
 *   executionTime: number|null,
 *   memoryUsed: number|null,
 *   stdout: string,
 *   stderr: string,
 *   compileOutput: string
 * }}
 */
export function getFinalResult(submissionData) {
  const statusId = submissionData?.status?.id ?? 13;
  const verdict = STATUS_MAP[statusId] ?? 'INTERNAL_ERROR';

  const executionTime =
    submissionData.time !== null && submissionData.time !== undefined
      ? parseFloat(submissionData.time) || null
      : null;

  const memoryUsed =
    submissionData.memory !== null && submissionData.memory !== undefined
      ? parseFloat(submissionData.memory) || null
      : null;

  return {
    verdict,
    executionTime,
    memoryUsed,
    stdout: decodeBase64(submissionData.stdout),
    stderr: decodeBase64(submissionData.stderr),
    compileOutput: decodeBase64(submissionData.compile_output),
  };
}
