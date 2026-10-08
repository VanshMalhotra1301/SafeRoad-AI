import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenAnalyzer }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#hero' },
    { label: 'Risk Drivers', href: '#problem' },
    { label: 'Risk Analyzer', href: '#analyzer' },
    { label: 'Insights', href: '#insights' },
    { label: 'Model Performance', href: '#model' },
    { label: 'Social Impact', href: '#society' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#06090F]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl py-3' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300">
            <Shield className="w-4 h-4 text-white" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#06090F] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white font-sans">SafeRoad</span>
              <span className="text-lg font-bold tracking-tight text-cyan-400">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono">Civic Safety Engine</p>
          </div>
        </a>

        {/* Live Status Telemetry Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>20,000 Incidents Indexed</span>
          <span className="text-slate-600">•</span>
          <span>R² = 0.88</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-cyan-400 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#analyzer"
            onClick={onOpenAnalyzer}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-[#06090F] hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Risk</span>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0F1D]/98 backdrop-blur-2xl border-b border-slate-800 px-6 py-4 mt-2 space-y-2.5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-slate-200 hover:text-cyan-400"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
