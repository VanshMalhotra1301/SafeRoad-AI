import React, { useState } from 'react';
import { 
  Sparkles, Sliders, Cloud, Eye, Car, MapPin, 
  Clock, SunMedium, Compass, ShieldAlert, Cpu, 
  CheckCircle2, Radio, Zap
} from 'lucide-react';
import { requestRiskPrediction } from '../services/api';
import RiskResult from './RiskResult';

export default function RoadRiskAnalyzer() {
  const initialInputs = {
    city: 'Delhi',
    road_type: 'highway',
    weather: 'fog',
    visibility: 'low',
    traffic_density: 'high',
    lanes: 3,
    traffic_signal: 0,
    temperature: 16.0,
    hour: 20,
    is_weekend: 0,
    road_surface: 'Wet or damp',
    lighting: 'Darkness - lights lit'
  };

  const [inputs, setInputs] = useState(initialInputs);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);

  const scanSequence = [
    "Analyzing road geometry, lane capacity & signal telemetry...",
    "Evaluating atmospheric conditions, visibility range & precipitation...",
    "Cross-referencing historical metropolitan traffic density distributions...",
    "Executing 100-tree Random Forest ensemble decision trees...",
    "Synthesizing risk profile, feature attributions & safety recommendations..."
  ];

  const presets = [
    {
      label: "Delhi Foggy Highway (Critical Risk)",
      badge: "Critical 92%",
      color: "border-red-500/40 bg-red-500/10 text-red-300",
      data: {
        city: 'Delhi',
        road_type: 'highway',
        weather: 'fog',
        visibility: 'low',
        traffic_density: 'high',
        lanes: 3,
        traffic_signal: 0,
        temperature: 13.0,
        hour: 20,
        is_weekend: 0,
        road_surface: 'Wet or damp',
        lighting: 'Darkness - no lighting'
      }
    },
    {
      label: "Mumbai Monsoon Rush (High Risk)",
      badge: "High 74%",
      color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
      data: {
        city: 'Mumbai',
        road_type: 'urban',
        weather: 'rain',
        visibility: 'medium',
        traffic_density: 'high',
        lanes: 4,
        traffic_signal: 1,
        temperature: 28.0,
        hour: 18,
        is_weekend: 0,
        road_surface: 'Wet or damp',
        lighting: 'Darkness - lights lit'
      }
    },
    {
      label: "Chandigarh Arterial Noon (Low Risk)",
      badge: "Low 16%",
      color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
      data: {
        city: 'Chandigarh',
        road_type: 'urban',
        weather: 'clear',
        visibility: 'high',
        traffic_density: 'low',
        lanes: 4,
        traffic_signal: 1,
        temperature: 24.0,
        hour: 12,
        is_weekend: 0,
        road_surface: 'Dry',
        lighting: 'Daylight'
      }
    }
  ];

  const handleInputChange = (field, val) => {
    setInputs(prev => ({ ...prev, [field]: val }));
    if (result) setResult(null); // Clear previous result when modifying inputs
  };

  const applyPreset = (presetData) => {
    setInputs(presetData);
    setResult(null);
  };

  const handleAnalyze = async () => {
    setIsScanning(true);
    setScanStep(0);
    setResult(null);

    // Step-by-step progress simulation
    const stepInterval = setInterval(() => {
      setScanStep(prev => {
        if (prev < scanSequence.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    try {
      const response = await requestRiskPrediction(inputs);
      setTimeout(() => {
        clearInterval(stepInterval);
        setIsScanning(false);
        setResult(response);
      }, scanSequence.length * 450 + 200);
    } catch (err) {
      clearInterval(stepInterval);
      setIsScanning(false);
    }
  };

  const isPeakHour = (inputs.hour >= 8 && inputs.hour <= 10) || (inputs.hour >= 17 && inputs.hour <= 20);

  return (
    <section id="analyzer" className="py-24 relative bg-[#06090F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Cpu className="w-4 h-4" />
            <span>Interactive Machine Learning Centerpiece</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Road Risk Analyzer
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed font-light">
            Configure real-world road and environmental conditions below. The trained Random Forest model will
            evaluate feature interactions and synthesize an empirical accident risk score.
          </p>
        </div>

        {/* Quick Test Preset Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 mr-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Presets:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset.data)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium border ${preset.color} hover:scale-105 active:scale-95 transition-all flex items-center gap-2`}
            >
              <span>{preset.label}</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-bold">{preset.badge}</span>
            </button>
          ))}
        </div>

        {/* Main Interactive Form Card */}
        <div className="mt-8 glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 relative shadow-2xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Input 1: Metropolitan City */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Target City</span>
              </label>
              <select
                value={inputs.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
              >
                <option value="Delhi" className="bg-[#0A0F1D]">Delhi NCR</option>
                <option value="Mumbai" className="bg-[#0A0F1D]">Mumbai</option>
                <option value="Bangalore" className="bg-[#0A0F1D]">Bengaluru</option>
                <option value="Chandigarh" className="bg-[#0A0F1D]">Chandigarh</option>
                <option value="Chennai" className="bg-[#0A0F1D]">Chennai</option>
                <option value="Kolkata" className="bg-[#0A0F1D]">Kolkata</option>
                <option value="Hyderabad" className="bg-[#0A0F1D]">Hyderabad</option>
                <option value="Pune" className="bg-[#0A0F1D]">Pune</option>
              </select>
            </div>

            {/* Input 2: Roadway Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Corridor Type</span>
              </label>
              <select
                value={inputs.road_type}
                onChange={(e) => handleInputChange('road_type', e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
              >
                <option value="highway" className="bg-[#0A0F1D]">Expressway / National Highway</option>
                <option value="urban" className="bg-[#0A0F1D]">Urban Arterial / City Road</option>
                <option value="rural" className="bg-[#0A0F1D]">Rural / Undivided Highway</option>
              </select>
            </div>

            {/* Input 3: Weather Condition */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span>Weather State</span>
              </label>
              <select
                value={inputs.weather}
                onChange={(e) => handleInputChange('weather', e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
              >
                <option value="clear" className="bg-[#0A0F1D]">Clear Sky / Normal</option>
                <option value="rain" className="bg-[#0A0F1D]">Heavy Monsoon Rain</option>
                <option value="fog" className="bg-[#0A0F1D]">Dense Winter Fog / Smog</option>
              </select>
            </div>

            {/* Input 4: Visibility Range */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Sightline Visibility</span>
              </label>
              <select
                value={inputs.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
              >
                <option value="high" className="bg-[#0A0F1D]">High Visibility (&gt; 1,000 meters)</option>
                <option value="medium" className="bg-[#0A0F1D]">Medium Visibility (200m – 1 km)</option>
                <option value="low" className="bg-[#0A0F1D]">Critical Low Visibility (&lt; 200 meters)</option>
              </select>
            </div>

            {/* Input 5: Traffic Density */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>Traffic Flow Density</span>
              </label>
              <select
                value={inputs.traffic_density}
                onChange={(e) => handleInputChange('traffic_density', e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
              >
                <option value="low" className="bg-[#0A0F1D]">Low Density (Free-flowing)</option>
                <option value="medium" className="bg-[#0A0F1D]">Moderate Density (Steady flow)</option>
                <option value="high" className="bg-[#0A0F1D]">High Density (Heavy / Gridlock)</option>
              </select>
            </div>

            {/* Input 6: Lanes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-300">
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Number of Lanes</span>
                </span>
                <span className="text-cyan-400 font-bold">{inputs.lanes} {inputs.lanes === 1 ? 'Lane' : 'Lanes'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={inputs.lanes}
                onChange={(e) => handleInputChange('lanes', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1 Lane</span>
                <span>3 Lanes</span>
                <span>6 Lanes</span>
              </div>
            </div>

            {/* Input 7: Time of Day Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-300">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Time of Day</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">{inputs.hour}:00 hrs</span>
                  {isPeakHour && (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                      Peak Rush
                    </span>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                step="1"
                value={inputs.hour}
                onChange={(e) => handleInputChange('hour', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>00:00 (Midnight)</span>
                <span>12:00 (Noon)</span>
                <span>23:00 (Night)</span>
              </div>
            </div>

            {/* Input 8: Signal Presence Toggle */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Intersection Traffic Signal</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('traffic_signal', 1)}
                  className={`py-3 rounded-xl text-xs font-semibold font-mono transition-all ${
                    inputs.traffic_signal === 1
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Signal Present
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('traffic_signal', 0)}
                  className={`py-3 rounded-xl text-xs font-semibold font-mono transition-all ${
                    inputs.traffic_signal === 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Unsignalized / Open
                </button>
              </div>
            </div>

            {/* Input 9: Road Surface (Dataset 2) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                <SunMedium className="w-4 h-4 text-cyan-400" />
                <span>Surface Condition</span>
              </label>
              <select
                value={inputs.road_surface}
                onChange={(e) => handleInputChange('road_surface', e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
              >
                <option value="Dry" className="bg-[#0A0F1D]">Dry & Stable Asphalt</option>
                <option value="Wet or damp" className="bg-[#0A0F1D]">Wet or Damp Pavement</option>
                <option value="Waterlogged" className="bg-[#0A0F1D]">Waterlogged / Slippery</option>
              </select>
            </div>

          </div>

          {/* Action Trigger Button */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-mono">
              Ensemble: <span className="text-slate-200">RandomForestRegressor (100 Trees)</span> • Stratified Validation
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isScanning}
              className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                isScanning
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 text-[#06090F] hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Road Risk</span>
                </>
              )}
            </button>
          </div>

          {/* Multi-Step Analysis Sequence Animation */}
          {isScanning && (
            <div className="mt-8 p-6 rounded-2xl bg-slate-950/90 border border-cyan-500/30 transition-all animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  AI Model Execution Sequence
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Step {scanStep + 1} of {scanSequence.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((scanStep + 1) / scanSequence.length) * 100}%` }}
                />
              </div>

              {/* Live Terminal Steps Log */}
              <div className="space-y-2 font-mono text-xs">
                {scanSequence.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2.5 transition-opacity duration-300 ${
                      idx === scanStep 
                        ? 'text-cyan-300 font-semibold' 
                        : (idx < scanStep ? 'text-slate-500' : 'text-slate-700')
                    }`}
                  >
                    {idx < scanStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      idx === scanStep ? (
                        <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-800 shrink-0" />
                      )
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Dynamic Risk Result Card */}
        {result && (
          <RiskResult
            result={result}
            onReset={() => setResult(null)}
            inputs={inputs}
          />
        )}

      </div>
    </section>
  );
}
