import supabase from '../utils/supabase.js';

const getSundayDates = () => {
  const dates = [];
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Generate for past 2 weeks to next 3 weeks
  for (let offset = -2; offset <= 3; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() - currentDay + (offset * 7));
    
    const start = new Date(d);
    start.setUTCHours(2, 30, 0, 0); // 8:00 AM IST
    
    const end = new Date(d);
    end.setUTCHours(3, 30, 0, 0); // 9:00 AM IST
    
    dates.push({ start, end });
  }
  return dates;
};

const ensureWeeklyContests = async () => {
  try {
    const sundays = getSundayDates();
    
    // Fetch all existing contests to check for duplicates
    const { data: existing, error: fetchErr } = await supabase
      .from('contests')
      .select('id, start_time');
      
    if (fetchErr) throw fetchErr;
    
    const existingStartTimes = new Set(existing?.map(e => new Date(e.start_time).toISOString()) || []);
    const refDate = new Date('2026-06-14T02:30:00Z'); // Reference Sunday = #48
    
    const newContests = [];
    for (const { start, end } of sundays) {
      const startISO = start.toISOString();
      if (!existingStartTimes.has(startISO)) {
        // Calculate sequence number N
        const diffMs = start.getTime() - refDate.getTime();
        const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
        const N = 48 + diffWeeks;
        
        newContests.push({
          id: `weekly-syntiq-challenge-${N}`,
          name: `Weekly Syntiq Challenge #${N}`,
          start_time: startISO,
          end_time: end.toISOString(),
          duration: '60 mins',
          difficulty: N % 2 === 0 ? 'Medium' : N % 3 === 0 ? 'Hard' : 'Easy',
          participants: Math.floor(Math.random() * 500) + 500,
          problems: ['two-sum', 'longest-palindromic-substring', 'edit-distance'],
          scoreboard: [
            { rank: 1, avatar: 'C', solved: ['two-sum', 'longest-palindromic-substring'], penalty: 45, username: 'competitive_wizard', lastSubmit: '00:38:12' },
            { rank: 2, avatar: 'A', solved: ['two-sum'], penalty: 20, username: 'algo_genius', lastSubmit: '00:18:10' }
          ]
        });
      }
    }
    
    if (newContests.length > 0) {
      const { error: insertErr } = await supabase
        .from('contests')
        .insert(newContests);
      if (insertErr) throw insertErr;
    }
  } catch (err) {
    console.error('Error in ensureWeeklyContests:', err);
  }
};

export const getAllContests = async (req, res) => {
  try {
    await ensureWeeklyContests();

    const { data: contests, error } = await supabase
      .from('contests')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;

    const now = new Date();
    const formattedContests = (contests || []).map(c => {
      const start = new Date(c.start_time);
      const end = new Date(c.end_time);
      
      let status = 'past';
      if (now >= start && now <= end) {
        status = 'live';
      } else if (now < start) {
        status = 'upcoming';
      }

      return {
        ...c,
        status
      };
    });

    res.json({
      status: 'success',
      contests: formattedContests
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

    const now = new Date();
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);
    
    let status = 'past';
    if (now >= start && now <= end) {
      status = 'live';
    } else if (now < start) {
      status = 'upcoming';
    }

    const formattedContest = {
      ...contest,
      status
    };

    res.json({
      status: 'success',
      contest: formattedContest
    });
  } catch (error) {
    console.error('Get contest by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve contest details'
    });
  }
};
