/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Necesario para el modo oscuro
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- Esto le dice que lea todos tus componentes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}