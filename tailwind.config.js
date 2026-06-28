/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        secondary: '#1E293B',
        card: '#1E293B',
        primary: '#3B82F6',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
      }
    },
  },
  plugins: [],
}
