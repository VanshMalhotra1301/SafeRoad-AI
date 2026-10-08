import React from 'react';
import { EyeOff, Clock, AlertOctagon, Users, ShieldAlert } from 'lucide-react';

export default function ProblemSection() {
  const highlights = [
    {
      metric: "+148%",
      title: "Fog & Low Visibility Surge",
      desc: "Accident risk jumps from 23.7% in daylight to 58.9% in dense fog.",
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "from-amber-500/10 to-transparent"
    },
    {
      metric: "60.4%",
      title: "Peak Rush Hour Risk",
      desc: "Commuter rush windows (8–10 AM & 5–8 PM) trigger a 58% severity spike.",
      color: "text-rose-400",
      border: "border-rose-500/30",
      bg: "from-rose-500/10 to-transparent"
    },
    {
      metric: "44.8%",
      title: "Major & Fatal Collisions",
      desc: "Out of 20,000 incidents, nearly half result in major trauma or fatalities.",
      color: "text-red-400",
      border: "border-red-500/30",
      bg: "from-red-500/10 to-transparent"
    },
    {
      metric: "5,544",
      title: "Tailgating & Lane Shifts",
      desc: "Dataset 2 confirms erratic lane changes and tailgating as top collision drivers.",
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "from-cyan-500/10 to-transparent"
    }
  ];

  return (
    <section id="problem" className="py-16 relative bg-[#080D18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Crisp Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-medium uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>The Reality</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Key Road Safety Drivers in India
          </h2>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Compounding factors from 20,000+ real records that escalate accident severity.
          </p>
        </div>

        {/* 4 Crisp Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className={`glass-panel p-5 rounded-2xl border ${item.border} bg-gradient-to-b ${item.bg}`}
            >
              <div className={`text-3xl font-black font-mono ${item.color}`}>
                {item.metric}
              </div>
              <h3 className="mt-2 text-sm font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
