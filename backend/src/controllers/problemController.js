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
    const { id, title, difficulty, acceptance, category, statement, constraints, starterCode, testCases, editorial, inputExample, outputExample, input_example, output_example } = req.body;

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
      editorial: editorial || "",
      input_example: inputExample || input_example || "",
      output_example: outputExample || output_example || ""
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

export const createProblemsBulk = async (req, res) => {
  try {
    const { problems } = req.body;

    if (!problems || !Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Request body must contain an array of problems'
      });
    }

    const problemsToInsert = problems.map(prob => {
      const cleanId = prob.id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return {
        id: cleanId,
        title: prob.title,
        difficulty: prob.difficulty || 'Easy',
        acceptance: prob.acceptance || '0.0%',
        category: prob.category || 'General',
        statement: prob.statement,
        constraints: prob.constraints || [],
        starter_code: prob.starterCode || prob.starter_code || {},
        test_cases: prob.testCases || prob.test_cases || [],
        editorial: prob.editorial || '',
        input_example: prob.inputExample || prob.input_example || '',
        output_example: prob.outputExample || prob.output_example || ''
      };
    });

    const { data, error } = await supabase
      .from('problems')
      .insert(problemsToInsert)
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({
      status: 'success',
      message: `Successfully imported ${data.length} problems`,
      count: data.length
    });
  } catch (error) {
    console.error('Bulk create problems error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to bulk create problems'
    });
  }
};
