/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./components/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx,css}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#ff1fa9",
          black: "#000000",
          white: "#ffffff",
          bronze: "#b87333",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        josefin: ["var(--font-josefin)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
