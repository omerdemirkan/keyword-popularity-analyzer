const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          100: "#F8F9FC",
          200: "#EBEFF7",
          300: "#D7DFEF",
          400: "#AFC0E0",
          500: "#87A0D0",
          600: "#5F81C1",
          700: "#3761B1",
          800: "#2C4E8E",
          900: "#213A6A",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
