/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      screens: {
        sm: "480px",
        md: "768px",
        lg: "976px",
        xl: "1440px",
      },
      colors: {
        primary: "#5F7161",
        primaryLight: "#869E89",
        primaryDark: "#4D604F",
        secondary: "#6D8B74",
        accent: "#EFEAD8",
        neutral: "#D0C9C0",
        background: "#2E2E2E",
        white: "#FFFFFF",
      },
      animation: {
        "bounce-short": "bounce",
      },
      font: {
        strong: "font-weight:700",
      },
    },
  },
  plugins: [],
};
