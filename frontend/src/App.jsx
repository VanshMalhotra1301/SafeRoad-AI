import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import RoadRiskAnalyzer from './components/RoadRiskAnalyzer';
import RoadSafetyInsights from './components/RoadSafetyInsights';
import AIModelInsights from './components/AIModelInsights';
import WhyThisMatters from './components/WhyThisMatters';
import Footer from './components/Footer';
import { fetchInsights, fetchModelStats } from './services/api';

export default function App() {
  const [insights, setInsights] = useState(null);
  const [modelStats, setModelStats] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [ins, stats] = await Promise.all([
          fetchInsights(),
          fetchModelStats()
        ]);
        setInsights(ins);
        setModelStats(stats);
      } catch (err) {
        console.error("Failed to load platform data:", err);
      }
    }
    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation */}
      <Navbar onOpenAnalyzer={() => {
        const el = document.getElementById('analyzer');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }} />

      <main>
        {/* 1. Hero: Core Vision, Indian Highway Imagery & Key Telemetry */}
        <Hero />

        {/* 2. Key Problem Drivers: 4 Crisp Stat Highlights */}
        <ProblemSection />

        {/* 3. Main Centerpiece: Road Risk Analyzer & Result */}
        <RoadRiskAnalyzer />

        {/* 4. Core Insights: Weather, Hourly Rush Curves & Optional Metro Map */}
        <RoadSafetyInsights insights={insights} />

        {/* 5. AI Model Performance: R² Score, Real Confusion Matrix, Top Feature Predictors */}
        <AIModelInsights metadata={modelStats} />

        {/* 6. Impact on Society & Responsible AI Principles */}
        <WhyThisMatters />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
