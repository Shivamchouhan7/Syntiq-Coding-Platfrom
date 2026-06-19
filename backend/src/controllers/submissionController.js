/**
 * submissionController.js
 *
 * Handles all /api/submissions/* routes for the Judge0-powered execution engine.
 *
 * Exports:
 *   runCode            — POST /api/submissions/run  (visible test cases, no DB write)
 *   submitCode         — POST /api/submissions/submit (hidden test cases, saves to DB)
 *   getSubmissionsHistory — GET /api/submissions/
 *   getSubmissionById  — GET /api/submissions/:id
 *
 * Security guarantees:
 *   - hidden_test_cases are NEVER fetched during runCode
 *   - hidden_test_cases are NEVER included in any API response
 *   - Source code is sanitized (null bytes stripped, max 65536 chars enforced)
 *   - Language is validated against LANGUAGE_IDS before any execution
 *   - userId always comes from authMiddleware (req.user.id), never from req.body
 */

import supabase from '../utils/supabase.js';
import {
  LANGUAGE_IDS,
  submitCode as judge0Submit,
  pollSubmission,
  getFinalResult,
} from '../services/judge0.service.js';
import { generateDriver } from '../services/driverGenerator.service.js';
import { compareOutputs } from '../services/checker.service.js';
import { judgeSubmission } from '../workers/judge.worker.js';

const MAX_SOURCE_LENGTH = 65536;

// ─────────────────────────────────────────────────────────────────────────────
// Input validation helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates that the language is one of the supported Judge0 languages.
 * @param {string} language
 * @returns {{ ok: boolean, error?: string }}
 */
function validateLanguage(language) {
  if (!language || typeof language !== 'string') {
    return { ok: false, error: 'language is required' };
  }
  if (!LANGUAGE_IDS[language.toLowerCase()]) {
    return {
      ok: false,
      error: `Unsupported language: "${language}". Supported values: ${Object.keys(LANGUAGE_IDS).join(', ')}`,
    };
  }
  return { ok: true };
}

/**
 * Sanitizes source code:
 *   - Strips null bytes (prevents header injection in compiled files)
 *   - Enforces a maximum character count
 * @param {any} raw
 * @returns {{ ok: boolean, code?: string, error?: string }}
 */
function sanitizeSourceCode(raw) {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'sourceCode is required and must be a string' };
  }
  const sanitized = raw.replace(/\0/g, '');
  if (sanitized.length > MAX_SOURCE_LENGTH) {
    return {
      ok: false,
      error: `Source code exceeds the maximum allowed length of ${MAX_SOURCE_LENGTH} characters`,
    };
  }
  if (sanitized.trim().length === 0) {
    return { ok: false, error: 'Source code cannot be empty' };
  }
  return { ok: true, code: sanitized };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/submissions/run
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs user code against visible test cases only.
 * Returns per-test-case results (passed/failed, actual vs expected output).
 * Does NOT write to the submissions table.
 *
 * Problem fields fetched: id, title, function_name, return_type, parameters, visible_test_cases
 * NEVER fetches: hidden_test_cases
 */
export const runCode = async (req, res) => {
  try {
    const { problemId, language, sourceCode } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────

    const langCheck = validateLanguage(language);
    if (!langCheck.ok) {
      return res.status(400).json({ status: 'error', message: langCheck.error });
    }

    const codeCheck = sanitizeSourceCode(sourceCode);
    if (!codeCheck.ok) {
      return res.status(400).json({ status: 'error', message: codeCheck.error });
    }

    if (!problemId) {
      return res.status(400).json({ status: 'error', message: 'problemId is required' });
    }

    const cleanCode = codeCheck.code;
    const langKey = language.toLowerCase();
    const languageId = LANGUAGE_IDS[langKey];

    // ── Fetch problem (NEVER include hidden_test_cases) ──────────────────────

    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('id, title, function_name, return_type, parameters, visible_test_cases')
      .eq('id', problemId)
      .maybeSingle();

    if (problemError) {
      console.error('[runCode] Supabase error fetching problem:', problemError.message);
      return res.status(500).json({ status: 'error', message: 'Failed to fetch problem data' });
    }
    if (!problem) {
      return res.status(404).json({ status: 'error', message: 'Problem not found' });
    }

    if (!problem.function_name) {
      return res.status(400).json({
        status: 'error',
        message:
          'This problem is missing required judge metadata (function_name). ' +
          'Please update the problem using the new schema fields (function_name, return_type, parameters, visible_test_cases).',
      });
    }

    const visibleTestCases = Array.isArray(problem.visible_test_cases)
      ? problem.visible_test_cases
      : [];

    if (visibleTestCases.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No visible test cases defined for this problem.',
      });
    }

    // ── Execute each visible test case sequentially ──────────────────────────

    const results = [];

    for (let i = 0; i < visibleTestCases.length; i++) {
      const testCase = visibleTestCases[i];
      try {
        // Generate complete source file (user code + driver)
        const fullSource = generateDriver(langKey, problem, testCase, cleanCode);

        // Submit to Judge0
        const token = await judge0Submit(fullSource, languageId);

        // Poll until terminal status
        const submissionData = await pollSubmission(token);

        // Decode and map result
        const result = getFinalResult(submissionData);

        // Determine pass/fail for this test case
        const outputMatches = compareOutputs(result.stdout, testCase.expectedOutput);
        const passed = result.verdict === 'ACCEPTED' && outputMatches;

        results.push({
          testCaseIndex: i,
          passed,
          actualOutput: result.stdout,
          expectedOutput: testCase.expectedOutput || '',
          executionTime: result.executionTime,
          verdict: result.verdict,
          // Include compiler/runtime info only on failure
          ...(passed
            ? {}
            : {
                stderr: result.stderr || '',
                compileOutput: result.compileOutput || '',
              }),
        });
      } catch (err) {
        console.error(`[runCode] Test case ${i} threw an exception:`, err.message);
        results.push({
          testCaseIndex: i,
          passed: false,
          actualOutput: '',
          expectedOutput: testCase.expectedOutput || '',
          executionTime: null,
          verdict: 'INTERNAL_ERROR',
          stderr: err.message,
          compileOutput: '',
        });
      }
    }

    return res.json({ status: 'success', results });
  } catch (error) {
    console.error('[runCode] Unexpected top-level error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while running your code.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/submissions/submit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits user code against all hidden test cases via the judge worker.
 * Saves the result to the database.
 * NEVER returns hidden_test_cases to the client.
 *
 * userId is taken from req.user.id (set by authMiddleware), never from req.body.
 * Problem fields fetched: id, title, difficulty, category, function_name, return_type,
 *   parameters, hidden_test_cases (used internally, never returned).
 */
export const submitCode = async (req, res) => {
  try {
    const { problemId, language, sourceCode } = req.body;
    const userId = req.user.id; // always from authMiddleware, never from body

    // ── Validation ──────────────────────────────────────────────────────────

    const langCheck = validateLanguage(language);
    if (!langCheck.ok) {
      return res.status(400).json({ status: 'error', message: langCheck.error });
    }

    const codeCheck = sanitizeSourceCode(sourceCode);
    if (!codeCheck.ok) {
      return res.status(400).json({ status: 'error', message: codeCheck.error });
    }

    if (!problemId) {
      return res.status(400).json({ status: 'error', message: 'problemId is required' });
    }

    const cleanCode = codeCheck.code;

    // ── Fetch problem INCLUDING hidden test cases (for internal judge use only) ──

    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('id, title, difficulty, category, function_name, return_type, parameters, hidden_test_cases')
      .eq('id', problemId)
      .maybeSingle();

    if (problemError) {
      console.error('[submitCode] Supabase error fetching problem:', problemError.message);
      return res.status(500).json({ status: 'error', message: 'Failed to fetch problem data' });
    }
    if (!problem) {
      return res.status(404).json({ status: 'error', message: 'Problem not found' });
    }

    if (!problem.function_name) {
      return res.status(400).json({
        status: 'error',
        message:
          'This problem is missing required judge metadata (function_name). ' +
          'Please update the problem using the new schema fields.',
      });
    }

    if (!Array.isArray(problem.hidden_test_cases) || problem.hidden_test_cases.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No hidden test cases defined for this problem. Cannot judge submission.',
      });
    }

    // ── Delegate to judge worker ─────────────────────────────────────────────

    const judgeResult = await judgeSubmission(problem, language, cleanCode, userId);

    // ── Async profile update (non-blocking) ─────────────────────────────────

    if (judgeResult.status === 'ACCEPTED') {
      updateUserStats(userId, problem).catch((err) => {
        console.error('[submitCode] Failed to update user stats (non-fatal):', err.message);
      });
    }

    // ── Return result — hidden_test_cases NEVER included ────────────────────

    return res.json({
      status: 'success',
      submissionId: judgeResult.submissionId,
      verdict: judgeResult.status,
      passedTestCases: judgeResult.passedTestCases,
      totalTestCases: judgeResult.totalTestCases,
      executionTime: judgeResult.executionTime,
      memoryUsed: judgeResult.memoryUsed,
    });
  } catch (error) {
    console.error('[submitCode] Unexpected top-level error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while processing your submission.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// User stats update (async helper)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates user XP, level, streak, and solved counts after an ACCEPTED submission.
 * Called asynchronously — does not block the API response.
 * XP is only awarded once per unique problem (deduplication check).
 */
async function updateUserStats(userId, problem) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('[updateUserStats] Could not fetch profile for', userId);
    return;
  }

  // Check if this problem was already solved (ACCEPTED) by this user before
  const { data: prevSolved } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', userId)
    .eq('problem_id', problem.id)
    .eq('status', 'ACCEPTED')
    .limit(2); // limit 2: 1 = current (just saved), 2 = a previous one

  const alreadySolvedBefore = prevSolved && prevSolved.length > 1;
  if (alreadySolvedBefore) return;

  // Compute updated solved counts
  const solvedCount = { ...({ easy: 0, medium: 0, hard: 0, total: 0 }), ...(profile.solved_count || {}) };
  solvedCount.total = (solvedCount.total || 0) + 1;
  const diffKey = (problem.difficulty || '').toLowerCase();
  if (solvedCount[diffKey] !== undefined) {
    solvedCount[diffKey] = (solvedCount[diffKey] || 0) + 1;
  }

  // XP based on difficulty
  let xpGained = 10;
  const diffUpper = (problem.difficulty || '').toUpperCase();
  if (diffUpper === 'MEDIUM' || diffUpper === 'MEDIUM') xpGained = 20;
  if (diffUpper === 'HARD') xpGained = 30;
  const xp = (profile.xp || 0) + xpGained;
  const level = Math.floor(xp / 100) + 1;

  // Skills
  const skills = { ...(profile.skills || {}) };
  const category = problem.category || 'General';
  skills[category] = (skills[category] || 0) + 1;

  // Streak: check previous ACCEPTED submission date
  let streak = profile.streak || 0;
  const { data: prevAccepted } = await supabase
    .from('submissions')
    .select('submitted_at, created_at')
    .eq('user_id', userId)
    .eq('status', 'ACCEPTED')
    .order('created_at', { ascending: false })
    .limit(2);

  if (!prevAccepted || prevAccepted.length <= 1) {
    streak = 1;
  } else {
    const prevDate = prevAccepted[1].submitted_at || prevAccepted[1].created_at;
    const todayStr = new Date().toISOString().split('T')[0];
    const prevDateStr = new Date(prevDate).toISOString().split('T')[0];
    const diffDays = Math.ceil(
      (new Date(todayStr) - new Date(prevDateStr)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      streak = (profile.streak || 0) + 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
    // diffDays === 0: same day, don't reset or increment
  }

  await supabase
    .from('profiles')
    .update({ xp, level, streak, solved_count: solvedCount, skills })
    .eq('id', userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/submissions/
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the submission history for the authenticated user.
 * Uses the Supabase JS client for backward compatibility with legacy submission records.
 * Handles both old column names (code, created_at) and new ones (source_code, submitted_at).
 */
export const getSubmissionsHistory = async (req, res) => {
  try {
    const { problemId } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('submissions')
      .select(`
        id,
        user_id,
        problem_id,
        source_code,
        code,
        language,
        status,
        execution_time,
        memory_used,
        submitted_at,
        created_at,
        passed_test_cases,
        total_test_cases,
        problems (
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (problemId) {
      query = query.eq('problem_id', problemId);
    }

    const { data: dbSubs, error } = await query;
    if (error) throw error;

    const submissionsList = (dbSubs || []).map((s) => ({
      id: s.id,
      userId: s.user_id,
      problemId: s.problem_id,
      problemTitle: s.problems?.title || 'Unknown Problem',
      language: s.language
        ? s.language.charAt(0).toUpperCase() + s.language.slice(1).toLowerCase()
        : 'Unknown',
      code: s.source_code || s.code || '',
      status: s.status || 'Unknown',
      runtime: s.execution_time != null ? `${s.execution_time}s` : 'N/A',
      memory: s.memory_used != null ? `${s.memory_used} KB` : 'N/A',
      passedTestCases: s.passed_test_cases ?? null,
      totalTestCases: s.total_test_cases ?? null,
      createdAt: s.submitted_at || s.created_at,
    }));

    return res.json({ status: 'success', submissions: submissionsList });
  } catch (error) {
    console.error('[getSubmissionsHistory] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve submissions history',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/submissions/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a single submission by ID, scoped to the authenticated user.
 * Handles both old (code/created_at) and new (source_code/submitted_at) column names.
 */
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: s, error } = await supabase
      .from('submissions')
      .select(`
        id,
        user_id,
        problem_id,
        source_code,
        code,
        language,
        status,
        execution_time,
        memory_used,
        submitted_at,
        created_at,
        passed_test_cases,
        total_test_cases,
        problems (
          title
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !s) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found or you are not authorized to view it',
      });
    }

    return res.json({
      status: 'success',
      submission: {
        id: s.id,
        userId: s.user_id,
        problemId: s.problem_id,
        problemTitle: s.problems?.title || 'Unknown Problem',
        language: s.language
          ? s.language.charAt(0).toUpperCase() + s.language.slice(1).toLowerCase()
          : 'Unknown',
        code: s.source_code || s.code || '',
        status: s.status || 'Unknown',
        runtime: s.execution_time != null ? `${s.execution_time}s` : 'N/A',
        memory: s.memory_used != null ? `${s.memory_used} KB` : 'N/A',
        passedTestCases: s.passed_test_cases ?? null,
        totalTestCases: s.total_test_cases ?? null,
        createdAt: s.submitted_at || s.created_at,
      },
    });
  } catch (error) {
    console.error('[getSubmissionById] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve submission details',
    });
  }
};
