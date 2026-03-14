module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A6C58',
          foreground: '#FFFFFF',
          hover: '#3A5545',
          active: '#2B3F33',
        },
        secondary: {
          DEFAULT: '#2C3E50',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#D97706',
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#F8F9FA',
          paper: '#FFFFFF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
