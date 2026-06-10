import { getDb, saveDb } from '../models/db.js';
import { runCode } from '../utils/codeRunner.js';

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

    const db = getDb();
    const problem = db.problems.find(p => p.id === problemId);

    if (!problem) {
      return res.status(404).json({
        status: 'error',
        message: 'Problem not found'
      });
    }

    const testCases = problem.testCases || [];
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
    const passedCount = results.filter(r => r.status === 'passed').count || results.filter(r => r.status === 'passed').length;

    if (action === 'run') {
      return res.json({
        status: 'success',
        action: 'run',
        runResults: results,
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

    // Create submission record
    const newSubmission = {
      id: `sub_${Date.now()}`,
      userId,
      username: req.user.username,
      problemId,
      problemTitle: problem.title,
      language,
      code,
      status: overallStatus,
      runtime: averageRuntime,
      memory: averageMemory,
      error: firstFailed ? firstFailed.error : null,
      createdAt: new Date().toISOString()
    };

    db.submissions.push(newSubmission);

    // If Accepted, update user progress
    let userUpdated = false;
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex !== -1 && overallStatus === 'Accepted') {
      const user = db.users[userIndex];

      // Check if this problem was already solved by this user
      const alreadySolved = db.submissions.some(
        s => s.userId === userId && s.problemId === problemId && s.status === 'Accepted' && s.id !== newSubmission.id
      );

      if (!alreadySolved) {
        // Increment solved counts
        user.solvedCount.total = (user.solvedCount.total || 0) + 1;
        const diffLower = problem.difficulty.toLowerCase();
        if (user.solvedCount[diffLower] !== undefined) {
          user.solvedCount[diffLower] = (user.solvedCount[diffLower] || 0) + 1;
        }

        // Grant XP based on difficulty
        let xpGained = 10;
        if (problem.difficulty === 'Medium') xpGained = 20;
        if (problem.difficulty === 'Hard') xpGained = 30;
        user.xp = (user.xp || 0) + xpGained;

        // Calculate Level-up (100 XP per level)
        const newLevel = Math.floor(user.xp / 100) + 1;
        user.level = newLevel;

        // Increment skills count
        const category = problem.category || 'General';
        if (user.skills[category] !== undefined) {
          user.skills[category] = (user.skills[category] || 0) + 1;
        } else {
          user.skills[category] = 1;
        }

        // Streak calculation
        const userAccepted = db.submissions.filter(
          s => s.userId === userId && s.status === 'Accepted' && s.id !== newSubmission.id
        );

        if (userAccepted.length === 0) {
          user.streak = 1;
        } else {
          // Sort to find the most recent previous accepted submission
          userAccepted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const latestPrev = userAccepted[0];
          
          const todayStr = new Date().toISOString().split('T')[0];
          const lastSubDateStr = new Date(latestPrev.createdAt).toISOString().split('T')[0];
          
          const diffTime = new Date(todayStr) - new Date(lastSubDateStr);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            user.streak = (user.streak || 0) + 1;
          } else if (diffDays > 1) {
            user.streak = 1;
          }
          // if diffDays === 0, keep current streak
        }

        userUpdated = true;
      }

      // Add to user's recent submissions list (limit to 10)
      user.recentSubmissions = [
        {
          id: newSubmission.id,
          problemId: problem.id,
          problemTitle: problem.title,
          status: overallStatus,
          language,
          createdAt: newSubmission.createdAt
        },
        ...(user.recentSubmissions || [])
      ].slice(0, 10);

      db.users[userIndex] = user;
      userUpdated = true;
    } else if (userIndex !== -1) {
      // Just record the failed submission to recentSubmissions
      const user = db.users[userIndex];
      user.recentSubmissions = [
        {
          id: newSubmission.id,
          problemId: problem.id,
          problemTitle: problem.title,
          status: overallStatus,
          language,
          createdAt: newSubmission.createdAt
        },
        ...(user.recentSubmissions || [])
      ].slice(0, 10);

      db.users[userIndex] = user;
      userUpdated = true;
    }

    saveDb(db);

    // Exclude password from returned user info
    let returnedUser = null;
    if (userIndex !== -1) {
      const { password, ...safeUser } = db.users[userIndex];
      returnedUser = safeUser;
    }

    res.json({
      status: 'success',
      action: 'submit',
      submission: newSubmission,
      passedCount,
      totalCount,
      user: returnedUser
    });

  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process submission due to a server error'
    });
  }
};

export const getSubmissionsHistory = (req, res) => {
  try {
    const { problemId } = req.query;
    const userId = req.user.id;
    const db = getDb();

    let submissionsList = db.submissions.filter(s => s.userId === userId);

    if (problemId) {
      submissionsList = submissionsList.filter(s => s.problemId === problemId);
    }

    // Sort by createdAt descending
    submissionsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

export const getSubmissionById = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDb();

    const submission = db.submissions.find(s => s.id === id && s.userId === userId);

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found or unauthorized'
      });
    }

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
