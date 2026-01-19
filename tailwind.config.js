/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cherish-blue': '#4A90E2',
        'cherish-pink': '#FF6B9D',
        'cherish-yellow': '#FFD93D',
        'cherish-green': '#6BCB77',
        'cherish-purple': '#A78BFA',
        'cherish-orange': '#FF8C42',
      },
    },
  },
  plugins: [],
}

