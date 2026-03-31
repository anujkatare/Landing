/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#a855f7',
        'brand-cyan': '#06b6d4',
      },
    },
  },
  plugins: [],
}
