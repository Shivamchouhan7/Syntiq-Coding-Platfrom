import { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, Send, RotateCcw, Copy, CheckCircle, 
  MessageSquare, ChevronRight, Terminal as TermIcon,
  Code2, Lightbulb, BookOpen, Brain, Loader2,
  LogIn, Shield
} from 'lucide-react';

export default function ProblemDetail({ isLoggedIn, user }) {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // State management
  const [activeTab, setActiveTab] = useState('description'); // description, editorial, submissions, discussion
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [consoleTab, setConsoleTab] = useState('testcases'); // testcases, result, aihints, aianalysis
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [runLogs, setRunLogs] = useState('');
  const [runResults, setRunResults] = useState(null); // null = no run yet, array = per-test-case results
  const [submissions, setSubmissions] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Discussion state
  const [newComment, setNewComment] = useState('');
  const [discussions, setDiscussions] = useState([]);

  // AI features state
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [aiHintsList, setAiHintsList] = useState([]);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [aiCodeReview, setAiCodeReview] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('syntiq_token');

    // 1. Fetch problem details
    const fetchProblemDetail = fetch(`${API_BASE}/problems/${id}`)
      .then(res => res.json())
      .then(data => data.problem || null)
      .catch(err => {
        console.error('Error fetching problem details:', err);
        return null;
      });

    // 2. Fetch submissions for this problem
    const fetchProblemSubmissions = token
      ? fetch(`${API_BASE}/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            const list = data.submissions || [];
            return list.filter(s => s.problemId === id);
          })
          .catch(err => {
            console.error('Error fetching submissions:', err);
            return [];
          })
      : Promise.resolve([]);

    Promise.all([fetchProblemDetail, fetchProblemSubmissions]).then(([probData, subsData]) => {
      if (probData) {
        setProblem(probData);
        setCode(probData.starterCode?.[selectedLang] || '');
        // Normalize DB shape {input, output} → UI shape {id, name, input, expected, status}
        const rawCases = probData.testCases || probData.test_cases || [];
        const normalized = rawCases.map((tc, i) => ({
          id: i,
          name: `Case ${i + 1}`,
          input: tc.input ?? '',
          expected: tc.output ?? tc.expected ?? '',
          status: null,
        }));
        setTestCases(normalized);
        setDiscussions(probData.discussion || []);
        
        // Format submissions
        const formattedSubs = subsData.map(s => ({
          id: s.id,
          status: s.status,
          runtime: s.runtime || 'N/A',
          memory: s.memory || 'N/A',
          lang: s.language
            ? s.language.charAt(0).toUpperCase() + s.language.slice(1).toLowerCase()
            : 'JavaScript',
          time: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'
        }));
        setSubmissions(formattedSubs);
      }
      setLoading(false);
    });
  }, [id]);

  // Sync starter code on language change
  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode?.[selectedLang] || '');
    }
  }, [selectedLang, problem]);

  // Copy code utility
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  // Reset code
  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset your code to the default template?")) {
      setCode(problem.starterCode[selectedLang] || '');
    }
  };

  // Auth gate: check login before running/submitting
  const requireAuth = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // Run Code — calls POST /api/submissions/run (visible test cases only, no DB write)
  const handleRunCode = async () => {
    if (!requireAuth()) return;

    setIsRunning(true);
    setConsoleTab('result');
    setRunLogs('⏳ Submitting to Judge0... please wait.');
    setRunResults(null);
    
    try {
      const token = localStorage.getItem('syntiq_token');
      const res = await fetch(`${API_BASE}/submissions/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem.id,
          language: selectedLang,
          sourceCode: code
        })
      });

      const data = await res.json();

      if (data.status === 'success') {
        const results = data.results || [];
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;

        // Build a human-readable log
        const logLines = results.map((r, i) => {
          const icon = r.passed ? '✅' : '❌';
          const lines = [`${icon} Case ${i + 1}: ${r.verdict}`];
          if (!r.passed) {
            lines.push(`   Expected : ${r.expectedOutput}`);
            lines.push(`   Got      : ${r.actualOutput || '(empty)'}`);
            if (r.compileOutput) lines.push(`   Compile  : ${r.compileOutput.trim()}`);
            if (r.stderr) lines.push(`   Stderr   : ${r.stderr.trim()}`);
          }
          if (r.executionTime != null) lines.push(`   Time     : ${r.executionTime}s`);
          return lines.join('\n');
        });

        setRunLogs(
          `${passedCount}/${totalCount} test cases passed\n\n` + logLines.join('\n\n')
        );
        setRunResults(results);

        // Update test-case pill statuses in the Test Cases panel
        setTestCases(prev =>
          prev.map((tc, idx) => ({
            ...tc,
            status: results[idx]?.passed ? 'passed' : results[idx] ? 'failed' : tc.status
          }))
        );
      } else {
        setRunLogs(`❌ Error: ${data.message || 'Failed to run code.'}`);
      }
    } catch (err) {
      setRunLogs('❌ Error: Unable to connect to server. Make sure the backend is running.');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code — calls POST /api/submissions/submit (hidden test cases, saves to DB)
  const handleSubmitCode = async () => {
    if (!requireAuth()) return;

    setIsSubmitting(true);
    setConsoleTab('result');
    setRunLogs('⏳ Judging your submission against hidden test cases...');
    
    try {
      const token = localStorage.getItem('syntiq_token');
      const res = await fetch(`${API_BASE}/submissions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem.id,
          language: selectedLang,
          sourceCode: code
        })
      });

      if (res.status === 401) {
        setShowLoginModal(true);
        return;
      }

      const data = await res.json();

      if (data.status === 'success') {
        // New response shape: { submissionId, verdict, passedTestCases, totalTestCases, executionTime, memoryUsed }
        setSubmitResult(data);
        setShowSubmitModal(true);
        setRunLogs(
          `${data.verdict}: ${data.passedTestCases}/${data.totalTestCases} test cases passed` +
          (data.executionTime != null ? `\nRuntime: ${data.executionTime}s` : '') +
          (data.memoryUsed != null ? `\nMemory: ${data.memoryUsed} KB` : '')
        );

        // Add to local submissions list
        const newSub = {
          id: data.submissionId || Date.now(),
          status: data.verdict,
          runtime: data.executionTime != null ? `${data.executionTime}s` : 'N/A',
          memory: data.memoryUsed != null ? `${data.memoryUsed} KB` : 'N/A',
          lang: selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1).toLowerCase(),
          time: 'Just now'
        };
        setSubmissions([newSub, ...submissions]);
      } else {
        setRunLogs(`❌ Submission Error: ${data.message || 'Failed to submit code.'}`);
      }
    } catch (err) {
      setRunLogs('❌ Error: Unable to connect to server. Make sure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comm = {
      user: user?.username || "current_user",
      avatar: (user?.username || "C").charAt(0).toUpperCase(),
      text: newComment,
      time: "Just now",
      replies: []
    };
    setDiscussions([comm, ...discussions]);
    setNewComment('');
  };

  // AI Hints triggers
  const getAiHint = async () => {
    if (hintsRevealed < 3 && !isFetchingHint) {
      setIsFetchingHint(true);
      const nextHintLevel = hintsRevealed + 1;
      setConsoleTab('aihints');
      
      try {
        const res = await fetch(`${API_BASE}/ai/hint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemTitle: problem.title,
            statement: problem.statement,
            language: selectedLang,
            code,
            hintLevel: nextHintLevel
          })
        });
        const data = await res.json();
        if (data.status === 'success') {
          setHintsRevealed(nextHintLevel);
          setAiHintsList(prev => [...prev, data.hint]);
        }
      } catch (err) {
        console.error('Error fetching hint:', err);
      } finally {
        setIsFetchingHint(false);
      }
    }
  };

  // AI Code Review simulation
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    setConsoleTab('aianalysis');
    setAiCodeReview('Syntiq AI is analyzing your code draft...');
    
    try {
      const res = await fetch(`${API_BASE}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: problem.title,
          statement: problem.statement,
          language: selectedLang,
          code
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAiCodeReview(data.analysis);
      } else {
        setAiCodeReview(`Error: ${data.message || 'Failed to analyze code'}`);
      }
    } catch (err) {
      setAiCodeReview('Error: Unable to connect to Syntiq AI services.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Synchronizing workspace details with Supabase...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen text-center text-slate-400">
        <Shield className="w-16 h-16 text-brand-error/60 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Problem Not Found</h2>
        <p className="text-xs mb-6">The coding challenge you are trying to view does not exist or has been deleted.</p>
        <Link to="/dashboard" className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Count lines for editor column
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex flex-col bg-[#08080c]">
      
      {/* Header bar: Problem title & difficulty */}
      <div className="border-b border-white/5 bg-bg-panel/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded bg-white/5 transition-colors">
            ← Explorer
          </Link>
          <span className="text-slate-500">/</span>
          <h1 className="text-base font-bold text-white leading-none">{problem.title}</h1>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            problem.difficulty === 'Easy' ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' :
            problem.difficulty === 'Medium' ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20' :
            'bg-brand-error/10 text-brand-error border border-brand-error/20'
          }`}>
            {problem.difficulty}
          </span>
        </div>

        {/* AI Action Quick Buttons */}
        <div className="flex gap-2">
          <button 
            id="quick-ai-hint-btn"
            onClick={getAiHint}
            className="flex items-center gap-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all glow-accent"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Get AI Hint {hintsRevealed > 0 && `(${hintsRevealed}/3)`}
          </button>
          
          <button 
            id="quick-ai-review-btn"
            onClick={runAiAnalysis}
            className="flex items-center gap-1.5 bg-brand-success/10 hover:bg-brand-success/20 text-brand-success border border-brand-success/30 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
          >
            <Brain className="w-3.5 h-3.5" />
            AI Code Feedback
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Description Tabs, Right Code Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-130px)]">
        
        {/* LEFT COLUMN: Panel Container with own scrollbar */}
        <div className="border-r border-white/5 flex flex-col h-full bg-bg-panel/20 overflow-y-auto">
          {/* Section Tabs */}
          <div className="flex border-b border-white/5 bg-bg-panel/40 sticky top-0 z-20">
            <button
              id="tab-desc"
              onClick={() => setActiveTab('description')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'description' ? 'border-brand-primary text-white bg-white/[0.02]' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Description
            </button>
            <button
              id="tab-editorial"
              onClick={() => setActiveTab('editorial')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'editorial' ? 'border-brand-primary text-white bg-white/[0.02]' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Editorial
            </button>
            <button
              id="tab-submissions"
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'submissions' ? 'border-brand-primary text-white bg-white/[0.02]' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TermIcon className="w-3.5 h-3.5" />
              Submissions ({submissions.length})
            </button>
            <button
              id="tab-discussion"
              onClick={() => setActiveTab('discussion')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'discussion' ? 'border-brand-primary text-white bg-white/[0.02]' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Discussion
            </button>
          </div>

          {/* Tab Content Areas */}
          <div className="p-6 flex-1 space-y-6">
            
            {/* 1. Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="flex gap-6 text-xs text-slate-400 font-medium">
                  <div>Acceptance Rate: <span className="text-white font-bold">{problem.acceptance}</span></div>
                  <div>Category: <span className="text-white font-bold">{problem.category}</span></div>
                </div>

                {/* Problem Description Statement */}
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {problem.statement}
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Example:</h3>
                  <div className="bg-bg-panel border border-white/5 rounded-xl p-4 font-mono text-xs space-y-2 text-slate-300">
                    <div><span className="text-slate-500 font-semibold">Input:</span> {problem.inputExample}</div>
                    <div><span className="text-slate-500 font-semibold">Output:</span> {problem.outputExample}</div>
                  </div>
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">Constraints:</h3>
                  <ul className="list-disc list-inside text-xs text-slate-400 font-mono space-y-1 pl-1">
                    {problem.constraints?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 2. Editorial Tab */}
            {activeTab === 'editorial' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Official Solution & Editorial</h2>
                <div className="prose prose-invert text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {problem.editorial || 'No official editorial available yet for this challenge.'}
                </div>
              </div>
            )}

            {/* 3. Submissions Tab */}
            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">My Submissions</h2>
                <div className="space-y-2">
                  {submissions.length > 0 ? (
                    submissions.map((sub) => (
                      <div 
                        key={sub.id} 
                        className="bg-bg-panel border border-white/5 rounded-xl p-4 flex items-center justify-between text-xs hover:border-white/10 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                             <span className={`font-bold ${
                              sub.status === 'Accepted' || sub.status === 'ACCEPTED'
                                ? 'text-brand-success'
                                : 'text-brand-error'
                            }`}>
                              {sub.status}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300">{sub.lang}</span>
                          </div>
                          <div className="text-slate-500">Submitted {sub.time}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-slate-300 font-mono">Runtime: {sub.runtime}</div>
                          <div className="text-slate-500 font-mono">Memory: {sub.memory}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs py-4 text-center">No submissions yet for this problem.</p>
                  )}
                </div>
              </div>
            )}

            {/* 4. Discussion Tab */}
            {activeTab === 'discussion' && (
              <div className="space-y-6">
                
                {/* Add Comment */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    placeholder="Ask a question or share alternative algorithms..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="3"
                    className="w-full bg-bg-panel border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>

                {/* Discussions List */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                  {discussions.length > 0 ? (
                    discussions.map((disc, idx) => (
                      <div key={idx} className="space-y-3 text-xs border-b border-white/5 pb-4 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold text-[10px] text-brand-primary">
                            {disc.avatar}
                          </div>
                          <span className="font-bold text-slate-300">{disc.user}</span>
                          <span className="text-slate-500">{disc.time}</span>
                        </div>
                        <p className="text-slate-400 pl-8">{disc.text}</p>

                        {/* Replies */}
                        {disc.replies && disc.replies.map((rep, rIdx) => (
                          <div key={rIdx} className="pl-8 space-y-2 mt-2">
                            <div className="bg-bg-panel/40 border border-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-full bg-brand-success/20 flex items-center justify-center font-bold text-[8px] text-brand-success">
                                  {rep.avatar}
                                </div>
                                <span className="font-bold text-slate-300">{rep.user}</span>
                                <span className="text-slate-500">{rep.time}</span>
                              </div>
                              <p className="text-slate-400 pl-7">{rep.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs py-4 text-center">No discussion posts yet. Be the first to start a conversation!</p>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Code Workspace & Console */}
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* IDE Toolbar */}
          <div className="border-b border-white/5 bg-bg-panel/40 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                id="editor-lang-select"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-bg-darker border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1 text-xs font-semibold text-white outline-none transition-colors"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (GCC 14)</option>
                <option value="java">Java (JDK 21)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button 
                id="reset-code-btn"
                onClick={handleResetCode}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors" 
                title="Reset Code Template"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                id="copy-code-btn"
                onClick={handleCopyCode}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors" 
                title="Copy Code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* IDE Editor Text Area with mock Line Numbers */}
          <div className="flex-1 flex overflow-hidden font-mono text-xs bg-[#0b0b10] relative">
            
            {/* Line numbers column */}
            <div className="w-10 bg-bg-panel/10 text-slate-600 text-right pr-2 select-none py-4 border-r border-white/5">
              {lineNumbers.map(n => (
                <div key={n} className="leading-5 h-5">{n}</div>
              ))}
            </div>

            {/* Editable code space */}
            <textarea
              id="code-editor-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow bg-transparent text-slate-300 p-4 leading-5 h-full focus:outline-none resize-none overflow-y-auto outline-none"
              spellCheck="false"
            />
          </div>

          {/* Lower console / terminal drawer */}
          <div className="border-t border-white/5 bg-[#0a0a0f] flex flex-col h-[280px]">
            {/* Console Tabs */}
            <div className="flex border-b border-white/5 bg-bg-panel/40 px-2 justify-between items-center">
              <div className="flex">
                <button
                  id="console-tab-cases"
                  onClick={() => setConsoleTab('testcases')}
                  className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                    consoleTab === 'testcases' ? 'border-brand-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Cases
                </button>
                <button
                  id="console-tab-result"
                  onClick={() => setConsoleTab('result')}
                  className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                    consoleTab === 'result' ? 'border-brand-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Console Output
                </button>
                <button
                  id="console-tab-hints"
                  onClick={() => setConsoleTab('aihints')}
                  className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                    consoleTab === 'aihints' ? 'border-brand-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AI Hints {hintsRevealed > 0 && `(${hintsRevealed}/3)`}
                </button>
                <button
                  id="console-tab-analysis"
                  onClick={() => setConsoleTab('aianalysis')}
                  className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                    consoleTab === 'aianalysis' ? 'border-brand-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AI Code Review
                </button>
              </div>

              {/* Action Buttons: Run & Submit */}
              <div className="flex items-center gap-2 pr-2">
                <button
                  id="run-code-btn"
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Run
                </button>
                <button
                  id="submit-code-btn"
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-md shadow-brand-primary/25 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit
                </button>
              </div>
            </div>

            {/* Console Panels */}
            <div className="p-4 flex-grow overflow-y-auto text-xs font-mono text-slate-300">
              
              {/* 1. Test Cases View */}
              {consoleTab === 'testcases' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {testCases.map((tc) => (
                      <div 
                        key={tc.id} 
                        className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 bg-bg-panel/40 ${
                          tc.status === 'passed' ? 'border-brand-success/30 text-brand-success' : 'border-white/5 text-slate-400'
                        }`}
                      >
                        {tc.status === 'passed' && <CheckCircle className="w-3.5 h-3.5" />}
                        {tc.name}
                      </div>
                    ))}
                  </div>

                  <div className="bg-bg-panel border border-white/5 rounded-lg p-3 space-y-2">
                    <div><span className="text-slate-500 font-semibold">Current Selected Input:</span></div>
                    <div className="bg-bg-darker p-2 rounded text-slate-300 font-semibold">{testCases[0]?.input}</div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                      <span>Expected Output: <strong className="text-slate-300">{testCases[0]?.expected || '—'}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Console Logs Output */}
              {consoleTab === 'result' && (
                <div className="bg-[#08080c] border border-white/5 rounded-lg p-3 h-full whitespace-pre-wrap leading-relaxed">
                  {runLogs || 'Press "Run" to test your execution against sample parameters.'}
                </div>
              )}

              {/* 3. AI Hints View */}
              {consoleTab === 'aihints' && (
                <div className="space-y-3">
                  {hintsRevealed === 0 ? (
                    <div className="text-center text-slate-500 py-6">
                      <Lightbulb className="w-8 h-8 text-brand-primary/40 mx-auto mb-2" />
                      <p>Stuck on an algorithmic concept? Reveal structured AI hints one-by-one.</p>
                      <button 
                        onClick={getAiHint}
                        className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold mt-4 inline-flex items-center gap-1"
                      >
                        Reveal Hint 1
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiHintsList.map((hintText, idx) => (
                        <div key={idx} className="bg-bg-panel border border-white/5 rounded-lg p-3 space-y-1">
                          <div className="text-brand-primary font-bold">Hint {idx + 1} of 3:</div>
                          <p className="text-slate-300 whitespace-pre-wrap">{hintText}</p>
                        </div>
                      ))}
                      
                      {hintsRevealed < 3 && (
                        <button 
                          onClick={getAiHint}
                          disabled={isFetchingHint}
                          className="text-brand-primary hover:text-brand-primary-hover font-bold flex items-center gap-0.5 text-xs py-1 disabled:opacity-50"
                        >
                          {isFetchingHint ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Fetching AI Hint...</>
                          ) : (
                            <>Reveal Hint {hintsRevealed + 1} <ChevronRight className="w-4 h-4" /></>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. AI Code Feedback Analysis */}
              {consoleTab === 'aianalysis' && (
                <div className="bg-[#08080c] border border-white/5 rounded-lg p-4 h-full overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 justify-center py-8">
                      <Loader2 className="w-5 h-5 text-brand-success animate-spin" />
                      <span>Syntiq AI analyzing code structure and space-time boundaries...</span>
                    </div>
                  ) : (
                    aiCodeReview || (
                      <div className="text-center text-slate-500 py-6">
                        <Brain className="w-8 h-8 text-brand-success/40 mx-auto mb-2" />
                        <p>Analyze your active draft for algorithmic optimization and edge case vulnerability.</p>
                        <button 
                          onClick={runAiAnalysis}
                          className="bg-brand-success text-slate-900 px-4 py-2 rounded-lg text-xs font-bold mt-4 inline-flex items-center gap-1 hover:bg-brand-success/90"
                        >
                          Review My Draft
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* SUBMIT RESULT MODAL */}
      {showSubmitModal && submitResult && (() => {
        const isAccepted = submitResult.verdict === 'ACCEPTED' || submitResult.verdict === 'Accepted';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className={`bg-bg-panel border ${
              isAccepted ? 'border-brand-success/30 glow-green' : 'border-brand-error/30'
            } w-full max-w-md rounded-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200`}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-full ${
                  isAccepted
                    ? 'bg-brand-success/10 text-brand-success border-brand-success/30 glow-green'
                    : 'bg-brand-error/10 text-brand-error border-brand-error/30'
                } flex items-center justify-center mb-4 border`}>
                  {isAccepted ? <CheckCircle className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                </div>

                <h3 className="text-xl font-bold text-white">{submitResult.verdict}</h3>
                <p className={`text-xs font-semibold mt-1 ${isAccepted ? 'text-brand-success' : 'text-brand-error'}`}>
                  {submitResult.passedTestCases ?? 0}/{submitResult.totalTestCases ?? 0} Test Cases Passed
                </p>

                <div className="grid grid-cols-2 gap-4 w-full my-6 bg-bg-darker p-4 rounded-xl border border-white/5 text-xs font-mono">
                  <div className="text-left border-r border-white/5 pr-2">
                    <div className="text-slate-500">Runtime</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {submitResult.executionTime != null ? `${submitResult.executionTime}s` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-left pl-2">
                    <div className="text-slate-500">Memory Usage</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {submitResult.memoryUsed != null ? `${submitResult.memoryUsed} KB` : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    id="modal-close-btn"
                    onClick={() => { setShowSubmitModal(false); setSubmitResult(null); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 rounded-xl border border-white/10 transition-colors"
                  >
                    Close Panel
                  </button>
                  <Link
                    id="modal-dashboard-btn"
                    to="/dashboard"
                    className={`flex-1 ${
                      isAccepted
                        ? 'bg-brand-success hover:bg-brand-success/90 text-slate-900'
                        : 'bg-white/10 hover:bg-white/15 text-white'
                    } text-xs font-bold py-3 rounded-xl transition-colors text-center`}
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* LOGIN REQUIRED MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-panel border border-brand-primary/30 w-full max-w-sm rounded-2xl p-6 glow-accent relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 border border-brand-primary/30 glow-accent">
                <Shield className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-white">Login Required</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                You need to be logged in to run or submit code. Sign in to track your progress and compete on the leaderboard.
              </p>
              
              <div className="flex gap-3 w-full mt-6">
                <button
                  id="login-modal-close-btn"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 rounded-xl border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <Link
                  id="login-modal-login-btn"
                  to="/login"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-brand-primary/25 text-center flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-primary hover:text-brand-primary-hover font-semibold transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
