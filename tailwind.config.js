/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#040508',
          card: '#090B12',
          surface: '#0E111C',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(168, 85, 247, 0.4)',
          purple: '#A855F7',
          violet: '#8B5CF6',
          indigo: '#6366F1',
          accent: '#C084FC',
          glow: 'rgba(168, 85, 247, 0.3)',
          cyan: '#38BDF8',
          emerald: '#34D399',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'spotlight': 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139, 92, 246, 0.28) 0%, rgba(99, 102, 241, 0.12) 45%, transparent 75%)',
        'glow-cone': 'conic-gradient(from 180deg at 50% 0%, rgba(168, 85, 247, 0.2) 0deg, rgba(99, 102, 241, 0.35) 45deg, rgba(168, 85, 247, 0.2) 90deg, transparent 180deg)',
      }
    },
  },
  plugins: [],
}
