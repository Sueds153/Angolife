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
        "gold-light": "#F5E0A3",
        "gold-primary": "#D4AF37",
        "gold-dark": "#AA8A2E",
        "background-dark": "#0A0A0A",
        "surface-dark": "#161616",
        "background-light": "#FAFAFA",
        "surface-light": "#FFFFFF",
        "border-gold": "rgba(212, 175, 55, 0.2)",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      }
    },
  },
  plugins: [],
}
