import { getDb, saveDb } from '../models/db.js';

export const getAllProblems = (req, res) => {
  try {
    const db = getDb();
    
    // We can map problems to exclude full details/test cases to save bandwidth, 
    // but returning the general metadata is fine for a light server.
    const problemsList = db.problems.map(problem => {
      // Exclude large fields if needed, or return all. Let's return standard list.
      const { testCases, editorial, ...listData } = problem;
      return listData;
    });

    res.json({
      status: 'success',
      problems: problemsList
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve problems'
    });
  }
};

export const getProblemById = (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const problem = db.problems.find(p => p.id === id);

    if (!problem) {
      return res.status(404).json({
        status: 'error',
        message: 'Problem not found'
      });
    }

    res.json({
      status: 'success',
      problem
    });
  } catch (error) {
    console.error('Get problem details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve problem details'
    });
  }
};

export const createProblem = (req, res) => {
  try {
    const { id, title, difficulty, acceptance, category, statement, constraints, starterCode, testCases } = req.body;

    if (!id || !title || !difficulty || !statement) {
      return res.status(400).json({
        status: 'error',
        message: 'Required fields: id, title, difficulty, statement'
      });
    }

    const db = getDb();

    if (db.problems.some(p => p.id === id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Problem ID already exists'
      });
    }

    const newProblem = {
      id,
      title,
      difficulty,
      acceptance: acceptance || "0.0%",
      category: category || "General",
      statement,
      constraints: constraints || [],
      starterCode: starterCode || {},
      testCases: testCases || [],
      editorial: req.body.editorial || "",
      discussion: []
    };

    db.problems.push(newProblem);
    saveDb(db);

    res.status(201).json({
      status: 'success',
      problem: newProblem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create problem'
    });
  }
};
