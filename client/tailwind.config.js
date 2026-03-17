export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#4FC3F7',
        success: '#4CAF50',
        warning: '#FFB300',
        'day-bg': '#F5F7FB',
        'card-bg': '#FFFFFF',
      },
      boxShadow: {
        'float': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'float-hover': '0 20px 40px -10px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
