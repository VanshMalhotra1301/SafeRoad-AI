import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { BarChart3, MapPin, CloudSun, Clock, Map } from 'lucide-react';
import IndiaRiskMap from './IndiaRiskMap';

export default function RoadSafetyInsights({ insights }) {
  const [showMap, setShowMap] = useState(false);

  if (!insights) return null;

  const { cities, hourly, weather, severity_distribution, summary } = insights;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-xl text-xs font-mono">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color || '#22D3EE' }}>
              {item.name}: {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section id="insights" className="py-16 relative bg-[#06090F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Data Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Road Safety Insights from 20,000 Incidents
            </h2>
          </div>

          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-400 border border-slate-700 hover:border-cyan-500/40 transition-all self-start sm:self-auto"
          >
            <Map className="w-3.5 h-3.5" />
            <span>{showMap ? "Hide Metro Map" : "View Interactive Metro Map"}</span>
          </button>
        </div>

        {/* Optional Metro Map Accordion */}
        {showMap && (
          <div className="mb-8">
            <IndiaRiskMap cities={cities} />
          </div>
        )}

        {/* 2-Column Clean Visual Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Severity & Weather Conditions */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Weather Condition vs Risk Score</h3>
                <p className="text-xs text-slate-400">Risk increases sharply in fog and rain.</p>
              </div>
              <CloudSun className="w-4 h-4 text-amber-400" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weather} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="weather" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avg_risk" name="Avg Risk" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Severity Stats Bar */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Severity Breakdown:</span>
                <span>Minor 55.1% • Major 29.9% • Fatal 14.9%</span>
              </div>
              <div className="w-full h-2.5 rounded-full flex overflow-hidden">
                <div style={{ width: '55.1%' }} className="bg-emerald-400" title="Minor (55.1%)" />
                <div style={{ width: '29.9%' }} className="bg-amber-400" title="Major (29.9%)" />
                <div style={{ width: '14.9%' }} className="bg-red-400" title="Fatal (14.9%)" />
              </div>
            </div>
          </div>

          {/* Card 2: 24-Hour Diurnal Hourly Curve */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">24-Hour Accident Risk Curve</h3>
                <p className="text-xs text-slate-400">Peaks during morning (8–10 AM) & evening (5–8 PM) rush hours.</p>
              </div>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGradShort" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time_label" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="avg_risk" name="Avg Risk" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#riskGradShort)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Takeaways Strip */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Rush Hours: <strong className="text-rose-400">60.4% Risk</strong></span>
              <span>Off-Peak: <strong className="text-emerald-400">38.3% Risk</strong></span>
              <span>Metros: <strong className="text-cyan-400">8 Indian Cities</strong></span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
