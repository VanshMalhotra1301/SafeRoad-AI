import React from 'react';
import { Building2, Radio, Ambulance, Eye, ShieldCheck, Scale, Database, Lock } from 'lucide-react';

export default function WhyThisMatters() {
  const impacts = [
    {
      icon: Building2,
      title: "Smart Cities & Vision Zero",
      desc: "Identifies high-risk road corridors to guide municipal safety retrofits."
    },
    {
      icon: Radio,
      title: "Intelligent Traffic Management",
      desc: "Triggers dynamic variable speed limits during fog and severe congestion."
    },
    {
      icon: Ambulance,
      title: "Emergency Dispatch Optimization",
      desc: "Pre-positions ambulances near predicted danger zones during peak rush hours."
    },
    {
      icon: Eye,
      title: "Public Commuter Awareness",
      desc: "Gives drivers clear foresight into environmental hazards and headway buffer needs."
    }
  ];

  const ethics = [
    {
      icon: Database,
      title: "Data Boundaries",
      desc: "Dataset covers 8 major Indian metros; micro-coordinates are synthetically sampled for privacy."
    },
    {
      icon: ShieldCheck,
      title: "Explainable by Design",
      desc: "Every risk score breaks down into contributing factors — zero opaque black-box decisions."
    },
    {
      icon: Scale,
      title: "Human Oversight",
      desc: "AI serves strictly as a decision-support advisory tool, not a replacement for human authority."
    }
  ];

  return (
    <section id="society" className="py-16 relative bg-[#06090F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Societal Impact & Ethics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI for Road Safety & Society
          </h2>
          <p className="mt-1 text-slate-400 text-sm">
            Transitioning traffic management from reactive cleanup to proactive, ethical protection.
          </p>
        </div>

        {/* 4 Crisp Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {impacts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* 3 Compact Responsible AI Pillars */}
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800/80">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-4 text-center">
            Responsible AI & Ethical Governance Principles
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ethics.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
                  <Icon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200 block mb-0.5">{item.title}</strong>
                    <span className="text-slate-400 font-light">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
