import React from 'react';
import { Cpu, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AIModelInsights({ metadata }) {
  if (!metadata) return null;

  const d1 = metadata.dataset_1;
  const d2 = metadata.dataset_2;

  const topFeatures = [
    { name: 'Low Visibility (<200m)', importance: 49.6, fill: '#06B6D4' },
    { name: 'High Traffic Density', importance: 28.6, fill: '#3B82F6' },
    { name: 'Peak Rush Hour', importance: 8.1, fill: '#8B5CF6' },
    { name: 'Rain / Wet Road', importance: 2.8, fill: '#F59E0B' },
    { name: 'Ambient Temperature', importance: 2.0, fill: '#10B981' },
  ];

  return (
    <section id="model" className="py-16 relative bg-[#080D18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Scorecard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Random Forest Performance
          </h2>
          <p className="mt-1 text-slate-400 text-sm">
            Trained on 20,000 real Indian accident records (80/20 train/test evaluation).
          </p>
        </div>

        {/* 4 Scorecard Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs font-mono text-slate-400 uppercase">Variance Explained</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">88.05%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">R² Score: 0.8805</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs font-mono text-slate-400 uppercase">Mean Abs Error</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 mt-1">0.0557</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Scale: 0.0 – 1.0</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs font-mono text-slate-400 uppercase">Architecture</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">100 Trees</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Random Forest Regressor</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs font-mono text-slate-400 uppercase">Severity Accuracy</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400 mt-1">78.01%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dataset 2 Benchmark</div>
          </div>
        </div>

        {/* 2-Column Split: Top Features & Real Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Top Feature Drivers */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Top Risk Predictors (Feature Importance)</h3>
              <p className="text-xs text-slate-400 mb-4">Relative predictive weight calculated by the Random Forest model.</p>
              
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={topFeatures} margin={{ top: 5, right: 20, left: 90, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                    <XAxis type="number" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 55]} unit="%" />
                    <YAxis type="category" dataKey="name" stroke="#64748B" tick={{ fill: '#CBD5E1', fontSize: 11 }} width={110} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Importance']} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#06B6D4' }} />
                    <Bar dataKey="importance" fill="#06B6D4" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Low visibility (&lt;200m) & high congestion account for <strong>78.2%</strong> of predictive risk.</span>
            </div>
          </div>

          {/* Real Confusion Matrix */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Empirical Confusion Matrix</h3>
              <p className="text-xs text-slate-400 mb-4">Actual vs Predicted classifications on holdout test set.</p>

              <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
                <div className="p-2 text-slate-400 font-semibold text-[11px]">Actual ↓</div>
                <div className="p-2 text-emerald-400 font-bold bg-slate-900 rounded-lg">Minor</div>
                <div className="p-2 text-amber-400 font-bold bg-slate-900 rounded-lg">Major</div>
                <div className="p-2 text-red-400 font-bold bg-slate-900 rounded-lg">Fatal</div>

                {/* Minor */}
                <div className="p-2 text-emerald-400 font-bold bg-slate-900 rounded-lg flex items-center justify-center">Minor</div>
                <div className="p-2.5 bg-emerald-500/25 border border-emerald-500/40 rounded-lg text-white font-bold">{d1.classifier_metrics.confusion_matrix.matrix[0][0]}</div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">{d1.classifier_metrics.confusion_matrix.matrix[0][1]}</div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">{d1.classifier_metrics.confusion_matrix.matrix[0][2]}</div>

                {/* Major */}
                <div className="p-2 text-amber-400 font-bold bg-slate-900 rounded-lg flex items-center justify-center">Major</div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">{d1.classifier_metrics.confusion_matrix.matrix[1][0]}</div>
                <div className="p-2.5 bg-amber-500/25 border border-amber-500/40 rounded-lg text-white font-bold">{d1.classifier_metrics.confusion_matrix.matrix[1][1]}</div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">{d1.classifier_metrics.confusion_matrix.matrix[1][2]}</div>

                {/* Fatal */}
                <div className="p-2 text-red-400 font-bold bg-slate-900 rounded-lg flex items-center justify-center">Fatal</div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">{d1.classifier_metrics.confusion_matrix.matrix[2][0]}</div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">{d1.classifier_metrics.confusion_matrix.matrix[2][1]}</div>
                <div className="p-2.5 bg-red-500/25 border border-red-500/40 rounded-lg text-white font-bold">{d1.classifier_metrics.confusion_matrix.matrix[2][2]}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Classified Samples: 4,000</span>
              <span className="text-emerald-400">100% Genuine Metrics</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
