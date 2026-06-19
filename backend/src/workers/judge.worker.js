/**
 * judge.worker.js
 *
 * Executes all hidden test cases for a submission using Judge0.
 * Saves the final result to the Prisma-managed submissions table.
 *
 * Contract:
 *   - hidden_test_cases are NEVER included in the return value
 *   - Stops at the FIRST failing test case (fail-fast strategy)
 *   - Tracks max execution time and max memory across all test cases
 *   - On any unexpected error in a single test case, records INTERNAL_ERROR and stops
 */

import {
  LANGUAGE_IDS,
  submitCode as judge0SubmitCode,
  pollSubmission,
  getFinalResult,
} from '../services/judge0.service.js';
import { generateDriver } from '../services/driverGenerator.service.js';
import { compareOutputs } from '../services/checker.service.js';
import prisma from '../utils/prisma.js';

// Verdict constants used by the judge and stored in the database.
export const SubmissionStatus = Object.freeze({
  ACCEPTED: 'ACCEPTED',
  WRONG_ANSWER: 'WRONG_ANSWER',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

/**
 * Runs all hidden test cases for a submission against Judge0.
 * Saves the result to Prisma. Returns a result object for the API response.
 *
 * SECURITY: The `problem` object passed in may contain `hidden_test_cases`,
 * but this function NEVER returns that field. The caller must not forward
 * the problem object directly to the client.
 *
 * @param {object} problem - Problem data fetched from Supabase (includes hidden_test_cases)
 * @param {string} language - 'cpp' | 'java' | 'python' | 'javascript'
 * @param {string} sourceCode - User's raw source code (unsanitized except null bytes)
 * @param {string} userId - Authenticated user ID from authMiddleware
 * @returns {Promise<{
 *   submissionId: string,
 *   status: string,
 *   passedTestCases: number,
 *   totalTestCases: number,
 *   executionTime: number|null,
 *   memoryUsed: number|null
 * }>}
 */
export async function judgeSubmission(problem, language, sourceCode, userId) {
  const hiddenTestCases = Array.isArray(problem.hidden_test_cases)
    ? problem.hidden_test_cases
    : [];
  const totalTestCases = hiddenTestCases.length;
  const langKey = language.toLowerCase();
  const languageId = LANGUAGE_IDS[langKey];

  let passedTestCases = 0;
  let finalStatus = SubmissionStatus.ACCEPTED;
  let maxExecutionTime = null;
  let maxMemoryUsed = null;

  for (const testCase of hiddenTestCases) {
    let testCaseVerdict = SubmissionStatus.INTERNAL_ERROR;

    try {
      // Generate the complete runnable source file for this test case
      const fullSource = generateDriver(langKey, problem, testCase, sourceCode);

      // Submit to Judge0
      const token = await judge0SubmitCode(fullSource, languageId);

      // Poll until Judge0 reaches a terminal status (or 15s timeout)
      const submissionData = await pollSubmission(token);

      // Extract structured result (decodes base64 stdout/stderr/compile_output)
      const result = getFinalResult(submissionData);

      // Accumulate max execution time and memory
      if (result.executionTime !== null) {
        maxExecutionTime =
          maxExecutionTime === null
            ? result.executionTime
            : Math.max(maxExecutionTime, result.executionTime);
      }
      if (result.memoryUsed !== null) {
        maxMemoryUsed =
          maxMemoryUsed === null
            ? result.memoryUsed
            : Math.max(maxMemoryUsed, result.memoryUsed);
      }

      // Determine this test case's verdict
      if (result.verdict !== 'ACCEPTED') {
        // Judge0 itself reported a non-success status (TLE, CE, RE, MLE, etc.)
        testCaseVerdict = result.verdict;
      } else if (!compareOutputs(result.stdout, testCase.expectedOutput)) {
        // Program ran but produced wrong output
        testCaseVerdict = SubmissionStatus.WRONG_ANSWER;
      } else {
        // Test case passed
        testCaseVerdict = SubmissionStatus.ACCEPTED;
        passedTestCases++;
      }
    } catch (err) {
      console.error(
        `[JudgeWorker] Unhandled error on test case for problem ${problem.id}:`,
        err.message
      );
      testCaseVerdict = SubmissionStatus.INTERNAL_ERROR;
    }

    // Fail-fast: stop on the first non-passing test case
    if (testCaseVerdict !== SubmissionStatus.ACCEPTED) {
      finalStatus = testCaseVerdict;
      break;
    }
  }

  // Edge case: if no hidden test cases exist, mark as INTERNAL_ERROR
  if (totalTestCases === 0) {
    finalStatus = SubmissionStatus.INTERNAL_ERROR;
    console.error(
      `[JudgeWorker] Problem ${problem.id} has no hidden test cases. Cannot judge.`
    );
  }

  // Persist the submission to the database via the Prisma singleton
  let savedSubmission;
  try {
    savedSubmission = await prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        code: sourceCode,
        language: langKey.toUpperCase(), // 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT'
        sourceCode,                      // The user's original code (no driver code)
        status: finalStatus,
        executionTime: maxExecutionTime !== null ? String(maxExecutionTime) : null,
        memoryUsed: maxMemoryUsed !== null ? String(maxMemoryUsed) : null,
        passedTestCases,
        totalTestCases,
      },
    });
  } catch (dbErr) {
    console.error('[JudgeWorker] Failed to persist submission to database:', dbErr.message);
    // Return a result even if DB write fails — don't crash the API response
    return {
      submissionId: null,
      status: finalStatus,
      passedTestCases,
      totalTestCases,
      executionTime: maxExecutionTime,
      memoryUsed: maxMemoryUsed,
    };
  }

  // Return only safe fields — hidden_test_cases NEVER leaves this function
  return {
    submissionId: savedSubmission.id,
    status: finalStatus,
    passedTestCases,
    totalTestCases,
    executionTime: maxExecutionTime,
    memoryUsed: maxMemoryUsed,
  };
}
