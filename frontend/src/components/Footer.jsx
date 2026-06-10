import { Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-brand-primary" />
          <span className="text-sm font-bold tracking-tight text-white">
            SYN<span className="text-brand-primary">TIQ</span>
          </span>
          <span className="text-xs text-slate-500 ml-2">© 2026 Syntiq. All rights reserved.</span>
        </div>
        
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-brand-primary transition-colors">Contact Support</a>
          <a href="#" className="hover:text-brand-primary transition-colors">API Docs</a>
        </div>
      </div>
    </footer>
  );
}
