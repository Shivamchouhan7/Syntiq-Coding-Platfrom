import supabase from '../utils/supabase.js';

export const getAllProblems = async (req, res) => {
  try {
    const { data: problems, error } = await supabase
      .from('problems')
      .select('id, title, difficulty, acceptance, category, statement, recommended');

    if (error) {
      throw error;
    }

    res.json({
      status: 'success',
      problems: problems || []
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve problems'
    });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: problem, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!problem) {
      return res.status(404).json({
        status: 'error',
        message: 'Problem not found'
      });
    }

    // Map snake_case database columns to camelCase frontend properties
    const mappedProblem = {
      ...problem,
      starterCode: problem.starter_code,
      testCases: problem.test_cases,
      inputExample: problem.input_example,
      outputExample: problem.output_example
    };

    res.json({
      status: 'success',
      problem: mappedProblem
    });
  } catch (error) {
    console.error('Get problem details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve problem details'
    });
  }
};

export const createProblem = async (req, res) => {
  try {
    const { id, title, difficulty, acceptance, category, statement, constraints, starterCode, testCases, editorial } = req.body;

    if (!id || !title || !difficulty || !statement) {
      return res.status(400).json({
        status: 'error',
        message: 'Required fields: id, title, difficulty, statement'
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
      starter_code: starterCode || {},
      test_cases: testCases || [],
      editorial: editorial || ""
    };

    const { data: problem, error } = await supabase
      .from('problems')
      .insert([newProblem])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          status: 'error',
          message: 'Problem ID already exists'
        });
      }
      throw error;
    }

    res.status(201).json({
      status: 'success',
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create problem'
    });
  }
};
