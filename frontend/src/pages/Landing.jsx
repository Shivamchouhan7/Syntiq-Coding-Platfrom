import { Link } from 'react-router-dom';
import { Sparkles, Trophy, BarChart3, ArrowRight, Code2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex flex-col justify-between overflow-hidden bg-bg-darker">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-success/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-20 flex-1 flex flex-col justify-center items-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-primary mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen AI Practice Engine
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-center tracking-tight text-white mb-6 leading-tight max-w-4xl">
          Code Smarter.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-success glow-text-primary">
            Level Up Faster.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg sm:text-xl text-center max-w-2xl mb-12 leading-relaxed">
          Syntiq pairs you with real-time AI feedback, automated code analysis, and competitive live contests to accelerate your technical interview preparation.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto">
          <Link
            id="landing-start-btn"
            to="/dashboard"
            className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/45 border border-brand-primary/50 group"
          >
            Start Practicing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            id="landing-contests-btn"
            to="/contests"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-semibold border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            View Contests
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 bg-bg-panel/40 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
          <div className="text-center md:border-r border-white/5 last:border-0 py-4 md:py-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">10,000+</div>
            <div className="text-sm text-slate-400">Problems Solved</div>
          </div>
          <div className="text-center md:border-r border-white/5 last:border-0 py-4 md:py-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-primary mb-1">500+</div>
            <div className="text-sm text-slate-400">Active Daily Coders</div>
          </div>
          <div className="text-center last:border-0 py-4 md:py-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-success mb-1">50+</div>
            <div className="text-sm text-slate-400">Contests Held</div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-12">
            Engineered for High-Performance Growth
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-bg-panel border border-white/5 rounded-xl p-6 hover:border-brand-primary/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 border border-brand-primary/20 group-hover:bg-brand-primary/20 transition-colors">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Hints</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stuck on a test case? Get granular hints that guide your logical structure without giving away the solution.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-bg-panel border border-white/5 rounded-xl p-6 hover:border-brand-primary/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Recommender</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Personalized topic pipelines dynamic to your submission history, targeting your weak spots to boost your ratings.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-bg-panel border border-white/5 rounded-xl p-6 hover:border-brand-primary/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-brand-success/10 flex items-center justify-center text-brand-success mb-4 border border-brand-success/20 group-hover:bg-brand-success/20 transition-colors">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Contests</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Test your skills in real-time. Code under pressure in rated weekend leagues against players worldwide.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-bg-panel border border-white/5 rounded-xl p-6 hover:border-brand-primary/30 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-brand-warning/10 flex items-center justify-center text-brand-warning mb-4 border border-brand-warning/20 group-hover:bg-brand-warning/20 transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Progress Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track growth with a GitHub-style activity heat map, skill radar charts, and interactive historical rating graphs.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
