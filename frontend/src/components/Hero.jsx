import React from 'react';
import { ArrowRight, BarChart2, ShieldCheck, MapPin, Activity, Cpu } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Photorealistic AI Generated Night Highway Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/hero-highway-night.jpg"
          alt="Indian Urban Highway at Night with Wet Asphalt and Headlights"
          className="w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.08] saturate-[1.12] scale-100 transition-all duration-700"
        />
        {/* Balanced Cinematic Gradient Overlays to keep road and traffic clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090F] via-[#06090F]/40 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06090F]/45 via-transparent to-[#06090F]/45" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Civic Tech Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/85 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-semibold tracking-wide uppercase shadow-xl shadow-black/50 mb-6 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Intelligent Transportation Safety Initiative</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>

        {/* Primary Headline with Text Shadow for High Contrast */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
          Predict Risk.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
            Prevent Impact.
          </span>
        </h1>

        {/* Subtitle with Shadow */}
        <p className="mt-6 text-lg sm:text-xl text-slate-100 max-w-3xl font-normal leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
          SafeRoad AI leverages historical Indian road accident records and a trained{' '}
          <span className="text-cyan-300 font-semibold underline decoration-cyan-500/50 underline-offset-4">Random Forest machine learning ensemble</span> to detect hazardous
          environmental, road, and traffic patterns before collisions occur.
        </p>

        {/* Primary & Secondary Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href="#analyzer"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 text-[#06090F] font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            <span>Analyze Road Risk</span>
            <ArrowRight className="w-5 h-5 text-[#06090F]" />
          </a>
          <a
            href="#insights"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-medium text-base hover:border-cyan-500/50 backdrop-blur-md transition-all duration-200"
          >
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <span>Explore Insights</span>
          </a>
        </div>

        {/* Real Data Telemetry Strip */}
        <div className="mt-16 w-full grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl">
          <div className="glass-panel p-5 rounded-2xl text-left border-l-2 border-l-cyan-400 hover:border-cyan-400/50 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider">Accidents Studied</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">20,000+</div>
            <p className="text-xs text-slate-400 mt-1">2022–2025 Indian Corridors</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl text-left border-l-2 border-l-blue-400 hover:border-blue-400/50 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider">Metros Covered</span>
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">8 Cities</div>
            <p className="text-xs text-slate-400 mt-1">Delhi, Mumbai, Bengaluru, etc.</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl text-left border-l-2 border-l-teal-400 hover:border-teal-400/50 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider">Model Variance</span>
              <Cpu className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">88.05% R²</div>
            <p className="text-xs text-slate-400 mt-1">Random Forest Fit</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl text-left border-l-2 border-l-purple-400 hover:border-purple-400/50 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider">Decision Trees</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">100 Trees</div>
            <p className="text-xs text-slate-400 mt-1">Multi-factor Ensemble</p>
          </div>
        </div>

      </div>
    </section>
  );
}
