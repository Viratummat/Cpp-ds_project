/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0B0F19',
          card: '#111827',
          surface: '#1E293B',
          border: '#273549',
          borderLight: '#334155',
          emerald: '#10B981',
          emeraldDark: '#059669',
          emeraldLight: '#34D399',
          muted: '#94A3B8',
          text: '#F8FAFC',
          gold: '#F59E0B',
          danger: '#EF4444',
          dangerDark: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
