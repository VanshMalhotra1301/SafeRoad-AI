import React from 'react';
import { Shield, ExternalLink, Code2, Heart, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#04060A] border-t border-slate-800/80 py-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-white">SafeRoad</span>
                <span className="text-lg font-bold text-cyan-400">AI</span>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-300">
              Predict Risk. Prevent Impact.
            </p>

            <p className="text-xs text-slate-400 max-w-md leading-relaxed font-light">
              An intelligent civic-technology initiative evaluating historical Indian road accident patterns
              to forecast risk profiles, demystify environmental catalysts, and empower evidence-based
              transportation safety decisions.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-cyan-400">
              <span>Bennett University — AI & Society Project</span>
            </div>
          </div>

          {/* Dataset References */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Kaggle Data Sources
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://www.kaggle.com/datasets/sehaj1104/indian-road-accident-dataset-20222025"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <span>Indian Road Accidents (2022–2025)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <span className="text-[10px] text-slate-400 font-mono">20,000 Records • 8 Metros</span>
              </li>
              <li>
                <a
                  href="https://www.kaggle.com/datasets/s3programmer/road-accident-severity-in-india"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <span>Road Accident Severity in India</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <span className="text-[10px] text-slate-400 font-mono">12,316 Records • 32 Features</span>
              </li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              System Modules
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#analyzer" className="hover:text-cyan-400 transition-colors">Risk Analyzer</a></li>
              <li><a href="#insights" className="hover:text-cyan-400 transition-colors">Safety Insights</a></li>
              <li><a href="#map" className="hover:text-cyan-400 transition-colors">Metropolitan Map</a></li>
              <li><a href="#model" className="hover:text-cyan-400 transition-colors">Random Forest Architecture</a></li>
              <li><a href="#society" className="hover:text-cyan-400 transition-colors">Civic & Society Applications</a></li>
              <li><a href="#responsible-ai" className="hover:text-cyan-400 transition-colors">Responsible AI Governance</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px] font-mono">
          <div>
            &copy; {new Date().getFullYear()} SafeRoad AI. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Built with React, Tailwind CSS, FastAPI & Scikit-Learn</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
