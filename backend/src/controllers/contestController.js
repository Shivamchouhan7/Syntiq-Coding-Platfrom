import supabase from '../utils/supabase.js';

export const getAllContests = async (req, res) => {
  try {
    const { data: contests, error } = await supabase
      .from('contests')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      status: 'success',
      contests: contests || []
    });
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve contests'
    });
  }
};

export const getContestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: contest, error } = await supabase
      .from('contests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!contest) {
      return res.status(404).json({
        status: 'error',
        message: 'Contest not found'
      });
    }

    res.json({
      status: 'success',
      contest
    });
  } catch (error) {
    console.error('Get contest by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve contest details'
    });
  }
};
