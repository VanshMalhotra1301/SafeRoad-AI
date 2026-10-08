import React from 'react';
import { 
  AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, 
  Lightbulb, Info, RefreshCw, CheckCircle2, AlertOctagon 
} from 'lucide-react';

export default function RiskResult({ result, onReset, inputs }) {
  if (!result) return null;

  const {
    risk_score,
    risk_percentage,
    risk_category,
    risk_color,
    severity_prediction,
    severity_probabilities,
    model_confidence,
    contributing_factors,
    safety_recommendations,
    disclaimer
  } = result;

  // Gauge calculation (circumference for SVG circle stroke)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (risk_percentage / 100) * circumference;

  return (
    <div className="mt-8 glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-slate-700/80 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6">
      
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>Model Ensemble Inference</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-semibold">{inputs.city}</span>
            <span className="text-slate-600">•</span>
            <span>{inputs.road_type.toUpperCase()} CORRIDOR</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Road Risk Assessment Profile
          </h3>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-slate-600"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Adjust Conditions</span>
        </button>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Circular Risk Meter Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="16"
                fill="transparent"
              />
              {/* Animated Foreground Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke={risk_color}
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: `drop-shadow(0 0 12px ${risk_color}80)`
                }}
              />
            </svg>

            {/* Inner Gauge Text Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
                Risk Score
              </span>
              <div className="text-5xl font-black font-mono tracking-tight text-white mt-1">
                {risk_percentage}<span className="text-2xl text-slate-400">%</span>
              </div>
              <div
                className="mt-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-md"
                style={{
                  backgroundColor: `${risk_color}20`,
                  color: risk_color,
                  border: `1px solid ${risk_color}50`
                }}
              >
                {risk_category}
              </div>
            </div>
          </div>

          {/* Model Confidence Rating */}
          <div className="mt-6 flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Ensemble Confidence:</span>
            <span className="text-cyan-300 font-bold">{model_confidence}%</span>
          </div>
        </div>

        {/* Right: Severity Distribution & Key Drivers */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Predicted Severity Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              <span>Severity Likelihood Profile</span>
              <span className="text-slate-300">Predicted Class: <strong className="text-white">{severity_prediction}</strong></span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Minor */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Minor</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {severity_probabilities.minor || 0}%
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${severity_probabilities.minor || 0}%` }} />
                </div>
              </div>

              {/* Major */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Major</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                  {severity_probabilities.major || 0}%
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${severity_probabilities.major || 0}%` }} />
                </div>
              </div>

              {/* Fatal */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Fatal</span>
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                </div>
                <div className="text-xl font-bold font-mono text-red-400 mt-1">
                  {severity_probabilities.fatal || 0}%
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-red-400 h-full rounded-full" style={{ width: `${severity_probabilities.fatal || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Explainable AI Factor Weights */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              <span>Primary Contributing Risk Factors</span>
              <span className="text-cyan-400">Dynamic Feature Weights</span>
            </div>

            <div className="space-y-3">
              {contributing_factors.map((factor, idx) => {
                const isIncrease = factor.direction === 'increase';
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isIncrease ? (
                          <TrendingUp className="w-4 h-4 text-red-400 shrink-0" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-white">{factor.factor}</span>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isIncrease ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isIncrease ? `+${factor.impact_pct}%` : `${factor.impact_pct}%`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed pl-6">
                      {factor.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Actionable Contextual Safety Recommendations */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-cyan-500/30">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4">
          <Lightbulb className="w-5 h-5" />
          <span>Intelligent Safety Advisories & Operating Protocols</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {safety_recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-300">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Responsible AI Transparency Disclaimer */}
      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Statistical Decision-Support Disclaimer:</strong> {disclaimer}
        </p>
      </div>

    </div>
  );
}
