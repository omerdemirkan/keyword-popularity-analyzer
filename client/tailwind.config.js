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
        "font-primary": "#303030",
        "font-secondary": "#5E5E5E",
      },
      boxShadow: {
        faint: "2px 2px 20px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
