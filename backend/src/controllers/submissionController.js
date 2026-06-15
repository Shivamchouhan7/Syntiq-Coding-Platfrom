import supabase from '../utils/supabase.js';
import { runCode } from '../utils/codeRunner.js';

const formatUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullname: user.fullname,
    avatarColor: user.avatar_color || '#808080',
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || 0,
    solvedCount: user.solved_count || { easy: 0, medium: 0, hard: 0, total: 0 },
    skills: user.skills || {
      "Arrays": 0,
      "Strings": 0,
      "DP": 0,
      "Trees": 0,
      "Graphs": 0,
      "Sorting": 0
    },
    contestHistory: [],
    recentSubmissions: [],
    createdAt: user.created_at
  };
};

export const submitCode = async (req, res) => {
  try {
    const { problemId, language, code, action } = req.body;
    const userId = req.user.id;

    if (!problemId || !language || !code || !action) {
      return res.status(400).json({
        status: 'error',
        message: 'Required fields: problemId, language, code, action'
      });
    }

    if (action !== 'run' && action !== 'submit') {
      return res.status(400).json({
        status: 'error',
        message: "Invalid action. Must be 'run' or 'submit'"
      });
    }

    // Fetch problem from database
    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .maybeSingle();

    if (problemError || !problem) {
      return res.status(404).json({
        status: 'error',
        message: 'Problem not found'
      });
    }

    const testCases = problem.test_cases || [];
    if (testCases.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No test cases defined for this problem'
      });
    }

    // Run the code against the test cases
    const results = await runCode(problemId, language, code, testCases);

    // Calculate passing test cases
    const totalCount = results.length;
    const passedCount = results.filter(r => r.status === 'passed').length;

    if (action === 'run') {
      // Strip hidden test case details before responding
      const sanitizedRun = results.map((r, idx) => {
        const tcName = String(testCases[idx]?.name || '');
        if (tcName.toLowerCase().includes('hidden')) {
          return { id: r.id, name: r.name, status: r.status, runtime: r.runtime, memory: r.memory };
        }
        return r;
      });
      return res.json({
        status: 'success',
        action: 'run',
        runResults: sanitizedRun,
        passedCount,
        totalCount
      });
    }

    // Action is 'submit'
    // Determine overall status
    let overallStatus = 'Accepted';
    let firstFailed = results.find(r => r.status !== 'passed');
    
    if (firstFailed) {
      const errorMsg = firstFailed.error || '';
      if (errorMsg.toLowerCase().includes('timed out') || errorMsg.toLowerCase().includes('timeout')) {
        overallStatus = 'Time Limit Exceeded';
      } else if (errorMsg.startsWith('Expected:')) {
        overallStatus = 'Wrong Answer';
      } else {
        overallStatus = 'Runtime Error';
      }
    }

    // Average runtime & memory
    const validRuntimes = results.map(r => parseFloat(r.runtime)).filter(t => !isNaN(t));
    const averageRuntime = validRuntimes.length > 0 
      ? `${(validRuntimes.reduce((a, b) => a + b, 0) / validRuntimes.length).toFixed(1)}ms` 
      : 'N/A';

    const validMemories = results.map(r => parseFloat(r.memory)).filter(m => !isNaN(m));
    const averageMemory = validMemories.length > 0
      ? `${(validMemories.reduce((a, b) => a + b, 0) / validMemories.length).toFixed(1)} MB`
      : 'N/A';

    // Insert submission record into database
    const { data: newSub, error: subError } = await supabase
      .from('submissions')
      .insert([{
        user_id: userId,
        problem_id: problemId,
        code,
        language,
        status: overallStatus,
        execution_time: averageRuntime,
        memory_used: averageMemory
      }])
      .select()
      .single();

    if (subError) throw subError;

    // ─── Update problem acceptance rate ────────────────────────────────────
    // Count all submissions and accepted submissions for this problem,
    // then recompute acceptance = (accepted / total) * 100 and persist it.
    const [{ count: totalSubs }, { count: acceptedSubs }] = await Promise.all([
      supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('problem_id', problemId),
      supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('problem_id', problemId)
        .eq('status', 'Accepted')
    ]);

    if (totalSubs > 0) {
      const acceptancePct = ((acceptedSubs / totalSubs) * 100).toFixed(1) + '%';
      await supabase
        .from('problems')
        .update({ acceptance: acceptancePct })
        .eq('id', problemId);
    }
    // ───────────────────────────────────────────────────────────────────────

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let updatedProfile = profile;

    if (profile && overallStatus === 'Accepted') {
      // Check if this problem was already solved by this user
      const { data: prevSolved } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .eq('status', 'Accepted')
        .neq('id', newSub.id)
        .limit(1);

      const alreadySolved = prevSolved && prevSolved.length > 0;

      if (!alreadySolved) {
        // Increment solved counts
        const solvedCount = profile.solved_count || { easy: 0, medium: 0, hard: 0, total: 0 };
        solvedCount.total = (solvedCount.total || 0) + 1;
        const diffLower = problem.difficulty.toLowerCase();
        if (solvedCount[diffLower] !== undefined) {
          solvedCount[diffLower] = (solvedCount[diffLower] || 0) + 1;
        }

        // Grant XP based on difficulty
        let xpGained = 10;
        if (problem.difficulty === 'Medium') xpGained = 20;
        if (problem.difficulty === 'Hard') xpGained = 30;
        const xp = (profile.xp || 0) + xpGained;

        // Calculate Level-up (100 XP per level)
        const level = Math.floor(xp / 100) + 1;

        // Increment skills count
        const skills = profile.skills || {};
        const category = problem.category || 'General';
        skills[category] = (skills[category] || 0) + 1;

        // Streak calculation
        let streak = profile.streak || 0;
        const { data: userAccepted } = await supabase
          .from('submissions')
          .select('created_at')
          .eq('user_id', userId)
          .eq('status', 'Accepted')
          .neq('id', newSub.id)
          .order('created_at', { ascending: false });

        if (!userAccepted || userAccepted.length === 0) {
          streak = 1;
        } else {
          const latestPrev = userAccepted[0];
          const todayStr = new Date().toISOString().split('T')[0];
          const lastSubDateStr = new Date(latestPrev.created_at).toISOString().split('T')[0];
          
          const diffTime = new Date(todayStr) - new Date(lastSubDateStr);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            streak = streak + 1;
          } else if (diffDays > 1) {
            streak = 1;
          }
        }

        // Update profile in DB
        const { data: newProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            xp,
            level,
            streak,
            solved_count: solvedCount,
            skills
          })
          .eq('id', userId)
          .select()
          .single();

        if (!updateError) {
          updatedProfile = newProfile;
        }
      }
    }

    // ─── Sanitize results before sending to client ─────────────────────────
    // Hidden test cases: send pass/fail status & runtime but never reveal
    // the input or expected output — that stays server-side only.
    const sanitizedResults = results.map((r, idx) => {
      const tcName = String(testCases[idx]?.name || '');
      if (tcName.toLowerCase().includes('hidden')) {
        return {
          id: r.id,
          name: r.name,
          status: r.status,
          runtime: r.runtime,
          memory: r.memory,
          // Deliberately omit: input, expected, actual, error
        };
      }
      return r;
    });
    // ───────────────────────────────────────────────────────────────────────

    res.json({
      status: 'success',
      action: 'submit',
      submission: {
        id: newSub.id,
        userId: newSub.user_id,
        username: profile?.username || 'Unknown',
        problemId: newSub.problem_id,
        problemTitle: problem.title,
        language: newSub.language,
        code: newSub.code,
        status: newSub.status,
        runtime: newSub.execution_time,
        memory: newSub.memory_used,
        createdAt: newSub.created_at
      },
      runResults: sanitizedResults,
      passedCount,
      totalCount,
      user: formatUser(updatedProfile)
    });

  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process submission due to a server error'
    });
  }
};

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
        code,
        language,
        status,
        execution_time,
        memory_used,
        created_at,
        problems (
          title
        )
      `)
      .eq('user_id', userId);

    if (problemId) {
      query = query.eq('problem_id', problemId);
    }

    const { data: dbSubs, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const submissionsList = (dbSubs || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      problemId: s.problem_id,
      problemTitle: s.problems?.title || 'Unknown Problem',
      language: s.language,
      code: s.code,
      status: s.status,
      runtime: s.execution_time,
      memory: s.memory_used,
      createdAt: s.created_at
    }));

    res.json({
      status: 'success',
      submissions: submissionsList
    });
  } catch (error) {
    console.error('Get submissions history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve submissions history'
    });
  }
};

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
        code,
        language,
        status,
        execution_time,
        memory_used,
        created_at,
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
        message: 'Submission not found or unauthorized'
      });
    }

    const submission = {
      id: s.id,
      userId: s.user_id,
      problemId: s.problem_id,
      problemTitle: s.problems?.title || 'Unknown Problem',
      language: s.language,
      code: s.code,
      status: s.status,
      runtime: s.execution_time,
      memory: s.memory_used,
      createdAt: s.created_at
    };

    res.json({
      status: 'success',
      submission
    });
  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve submission details'
    });
  }
};
