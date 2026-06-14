import { useState } from 'react';
import { API_BASE } from '../config';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Code2, Play, FileText, CheckCircle, 
  AlertTriangle, Loader2, Sparkles, BookOpen, Layers,
  Upload, Download, FileJson, Check, AlertCircle
} from 'lucide-react';

export default function AdminAddProblem() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ----------------------------------------------------
  // SINGLE CREATION FORM STATES
  // ----------------------------------------------------
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Algorithms');
  const [acceptance, setAcceptance] = useState('0.0%');
  const [statement, setStatement] = useState('');
  const [editorial, setEditorial] = useState('');
  
  const [constraints, setConstraints] = useState(['1 <= nums.length <= 10^5']);
  const [inputExample, setInputExample] = useState('');
  const [outputExample, setOutputExample] = useState('');

  const [activeLangTab, setActiveLangTab] = useState('javascript');
  const [starterCode, setStarterCode] = useState({
    javascript: 'function solve(nums) {\n  // Write your code here\n}',
    python: 'def solve(nums):\n    # Write your code here\n    pass',
    cpp: 'class Solution {\npublic:\n    void solve() {\n        \n    }\n};',
    java: 'class Solution {\n    public void solve() {\n        \n    }\n}'
  });

  const [testCases, setTestCases] = useState([
    { id: 'tc1', name: 'Case 1', input: '', expected: '' }
  ]);

  // ----------------------------------------------------
  // BULK IMPORT STATES
  // ----------------------------------------------------
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedProblems, setParsedProblems] = useState([]);
  const [bulkError, setBulkError] = useState('');

  // ----------------------------------------------------
  // SINGLE CREATION HANDLERS
  // ----------------------------------------------------
  const handleAddConstraint = () => {
    setConstraints([...constraints, '']);
  };

  const handleUpdateConstraint = (index, value) => {
    const next = [...constraints];
    next[index] = value;
    setConstraints(next);
  };

  const handleRemoveConstraint = (index) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const handleAddTestCase = () => {
    const newId = `tc${testCases.length + 1}`;
    setTestCases([...testCases, { id: newId, name: `Case ${testCases.length + 1}`, input: '', expected: '' }]);
  };

  const handleUpdateTestCase = (index, field, value) => {
    const next = [...testCases];
    next[index][field] = value;
    setTestCases(next);
  };

  const handleRemoveTestCase = (index) => {
    if (testCases.length === 1) return;
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleStarterCodeChange = (lang, codeValue) => {
    setStarterCode({
      ...starterCode,
      [lang]: codeValue
    });
  };

  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!id || !title || !statement) {
      setError('Please fill in required fields: Slug ID, Title, and Problem Statement.');
      return;
    }

    const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const activeConstraints = constraints.filter(c => c.trim() !== '');
    const activeTestCases = testCases.filter(tc => tc.input.trim() !== '' || tc.expected.trim() !== '');

    if (activeTestCases.length === 0) {
      setError('You must configure at least one active test case.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        id: cleanId,
        title,
        difficulty,
        category,
        acceptance,
        statement,
        constraints: activeConstraints,
        starterCode,
        testCases: activeTestCases,
        editorial,
        inputExample: inputExample || activeTestCases[0]?.input || '',
        outputExample: outputExample || activeTestCases[0]?.expected || ''
      };

      const res = await fetch(`${API_BASE}/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status === 'success') {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          navigate(`/problem/${cleanId}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to create problem.');
      }
    } catch (err) {
      setError('Connection to server failed. Ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // BULK IMPORT HANDLERS
  // ----------------------------------------------------
  const handleFileChange = (e) => {
    setBulkError('');
    setParsedProblems([]);
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setBulkError('Invalid file type. Please upload a valid .json file.');
      return;
    }

    setBulkFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const problemsArr = Array.isArray(json) ? json : [json];

        // Basic Schema Validation
        const valid = problemsArr.every((p, index) => {
          if (!p.id || !p.title || !p.statement) {
            setBulkError(`Problem at position ${index + 1} is missing required fields (id, title, or statement).`);
            return false;
          }
          return true;
        });

        if (valid) {
          setParsedProblems(problemsArr);
        }
      } catch (err) {
        setBulkError('JSON Parsing Error. Ensure the file contains well-formatted JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if (parsedProblems.length === 0) return;
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/problems/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ problems: parsedProblems })
      });

      const data = await res.json();

      if (data.status === 'success') {
        setSuccess(true);
        setParsedProblems([]);
        setBulkFile(null);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to import problems.');
      }
    } catch (err) {
      setError('Connection to server failed. Ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        id: "palindrome-number",
        title: "Palindrome Number",
        difficulty: "Easy",
        category: "Math",
        statement: "Given an integer x, return true if x is a palindrome, and false otherwise.",
        constraints: ["-2^31 <= x <= 2^31 - 1"],
        starterCode: {
          javascript: "function isPalindrome(x) {\n  // Write code here\n}",
          python: "def isPalindrome(self, x: int) -> bool:\n    pass"
        },
        testCases: [
          { id: "tc1", name: "Case 1", input: "121", expected: "true" },
          { id: "tc2", name: "Case 2", input: "-121", expected: "false" }
        ],
        editorial: "Compare the string representation of x with its reverse."
      }
    ];

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "syntiq_problems_template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 bg-[#08080c] min-h-screen text-slate-200">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-5 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-primary" />
            Syntiq Creator Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">Design single problems manually or import whole sets via JSON files.</p>
        </div>

        {/* Tab selection toggles */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('single'); setError(''); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'single' ? 'bg-brand-primary text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual Editor
          </button>
          <button
            onClick={() => { setActiveTab('bulk'); setError(''); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'bulk' ? 'bg-brand-primary text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON Bulk Importer
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-brand-error/10 border border-brand-error/20 rounded-xl p-4 flex items-start gap-3 mb-6 text-brand-error text-xs">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-brand-success/10 border border-brand-success/20 rounded-xl p-4 flex items-start gap-3 mb-6 text-brand-success text-xs">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 animate-bounce" />
          <div>Import completed successfully! Redirecting...</div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 1: SINGLE MANUAL EDITOR
          ---------------------------------------------------- */}
      {activeTab === 'single' && (
        <form onSubmit={handleSubmitSingle} className="space-y-8">
          
          <section className="bg-bg-panel/40 border border-white/5 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-primary" />
              1. Core Configurations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Problem Title <span className="text-brand-error">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!id) {
                      setId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Reverse Linked List"
                  className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Unique Slug ID <span className="text-brand-error">*</span></label>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. reverse-linked-list"
                  className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Category / Tag</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Arrays, Recursion"
                  className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          <section className="bg-bg-panel/40 border border-white/5 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-primary" />
              2. Problem Specification
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Problem Description Statement <span className="text-brand-error">*</span></label>
              <textarea
                required
                rows="8"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Describe the problem, input format, and output format..."
                className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl p-4 text-xs text-white placeholder-slate-600 outline-none transition-colors font-sans resize-y"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">Problem Constraints</label>
                <button
                  type="button"
                  onClick={handleAddConstraint}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Constraint
                </button>
              </div>
              
              <div className="space-y-2">
                {constraints.map((constraint, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={constraint}
                      onChange={(e) => handleUpdateConstraint(idx, e.target.value)}
                      placeholder="e.g. 1 <= nums.length <= 10^5"
                      className="flex-grow bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveConstraint(idx)}
                      className="p-2.5 text-slate-500 hover:text-brand-error hover:bg-brand-error/5 rounded-xl border border-white/5 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-bg-panel/40 border border-white/5 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-primary" />
              3. Starter Code Templates
            </h2>

            <div className="border border-white/5 rounded-xl overflow-hidden bg-[#07070a]">
              <div className="flex border-b border-white/5 bg-white/[0.02]">
                {['javascript', 'python', 'cpp', 'java'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLangTab(lang)}
                    className={`px-5 py-3 text-xs font-semibold transition-colors border-b-2 ${
                      activeLangTab === lang 
                        ? 'border-brand-primary text-white bg-white/[0.02]' 
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                  >
                    {lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-[#0a0a0f]">
                <textarea
                  rows="10"
                  value={starterCode[activeLangTab]}
                  onChange={(e) => handleStarterCodeChange(activeLangTab, e.target.value)}
                  className="w-full bg-transparent text-slate-300 font-mono text-xs leading-relaxed focus:outline-none outline-none resize-none"
                  spellCheck="false"
                />
              </div>
            </div>
          </section>

          <section className="bg-bg-panel/40 border border-white/5 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-brand-primary" />
              4. Execution & Validation Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Public Example Input</label>
                <input
                  type="text"
                  value={inputExample}
                  onChange={(e) => setInputExample(e.target.value)}
                  placeholder="e.g. [2,7,11,15]\n9"
                  className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Public Example Output</label>
                <input
                  type="text"
                  value={outputExample}
                  onChange={(e) => setOutputExample(e.target.value)}
                  placeholder="e.g. [0,1]"
                  className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">Test Cases <span className="text-brand-error">*</span></label>
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Test Case
                </button>
              </div>

              <div className="space-y-4">
                {testCases.map((tc, idx) => (
                  <div key={idx} className="bg-bg-panel border border-white/5 rounded-xl p-4 space-y-3 relative animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-xs font-bold text-white">{tc.name}</span>
                      <button
                        type="button"
                        disabled={testCases.length === 1}
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-slate-500 hover:text-brand-error disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Input Parameter</label>
                        <textarea
                          rows="2"
                          value={tc.input}
                          onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                          placeholder="Raw parameters value..."
                          className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Expected Output</label>
                        <textarea
                          rows="2"
                          value={tc.expected}
                          onChange={(e) => handleUpdateTestCase(idx, 'expected', e.target.value)}
                          placeholder="Expected output comparison..."
                          className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-bg-panel/40 border border-white/5 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-primary" />
              5. Editorial Solution (Optional)
            </h2>

            <div className="space-y-2">
              <textarea
                rows="6"
                value={editorial}
                onChange={(e) => setEditorial(e.target.value)}
                placeholder="Explain the time/space complexity and logical steps for solving this challenge..."
                className="w-full bg-[#0a0a0f] border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl p-4 text-xs text-white placeholder-slate-600 outline-none transition-colors font-sans resize-y"
              />
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl px-8 py-3 text-xs font-bold transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Publish Challenge
            </button>
          </div>

        </form>
      )}

      {/* ----------------------------------------------------
          TAB 2: BULK JSON IMPORTER
          ---------------------------------------------------- */}
      {activeTab === 'bulk' && (
        <div className="space-y-8">
          
          <section className="bg-bg-panel/40 border border-white/5 rounded-2xl p-8 text-center space-y-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-brand-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              <Upload className="w-8 h-8 text-brand-primary" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Upload Problemset JSON</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Upload a `.json` file containing a single problem or an array of multiple challenges matching the schema.</p>
            </div>

            {/* Hidden Input File */}
            <label className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
              <FileJson className="w-4 h-4" />
              Choose JSON File
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>

            {bulkFile && (
              <div className="text-xs text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                <FileJson className="w-3.5 h-3.5" />
                {bulkFile.name} ({(bulkFile.size / 1024).toFixed(1)} KB)
              </div>
            )}

            {bulkError && (
              <div className="bg-brand-error/10 border border-brand-error/20 rounded-xl p-3 text-brand-error text-xs flex items-center gap-2 max-w-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-brand-primary-hover transition-colors mt-2"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template JSON
            </button>
          </section>

          {/* Parsed List Preview */}
          {parsedProblems.length > 0 && (
            <section className="bg-bg-panel/40 border border-white/5 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preview ({parsedProblems.length} Problems)</h3>
                  <p className="text-[11px] text-slate-400">Review the validated data structure before pushing to Supabase.</p>
                </div>
                <button
                  onClick={handleBulkSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-brand-success text-bg-dark font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-brand-success/90 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                  Import All Challenges
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {parsedProblems.map((p, idx) => (
                  <div 
                    key={idx} 
                    className="bg-[#0b0b10] border border-white/5 rounded-xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white leading-tight">{p.title}</h4>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          p.difficulty === 'Easy' ? 'bg-brand-success/10 text-brand-success' :
                          p.difficulty === 'Medium' ? 'bg-brand-warning/10 text-brand-warning' :
                          'bg-brand-error/10 text-brand-error'
                        }`}>
                          {p.difficulty || 'Easy'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">Slug ID: {p.id}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/[0.03]">
                      <span>Category: <strong className="text-slate-200">{p.category || 'General'}</strong></span>
                      <span>Test cases: <strong className="text-slate-200">{(p.testCases || p.test_cases || []).length}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  );
}
