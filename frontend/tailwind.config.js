/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06090F',
          900: '#0A0F1D',
          850: '#0F172A',
          800: '#152037',
          750: '#1E293B',
          700: '#2A3854',
          600: '#475569',
        },
        brand: {
          cyan: '#06B6D4',
          cyanGlow: '#22D3EE',
          blue: '#3B82F6',
          indigo: '#6366F1',
        },
        risk: {
          low: '#10B981',
          moderate: '#F59E0B',
          high: '#F97316',
          critical: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 35px -5px rgba(59, 130, 246, 0.35)',
        'glow-red': '0 0 35px -5px rgba(239, 68, 68, 0.4)',
        'glow-amber': '0 0 35px -5px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.35)',
        'card-elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 3s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
