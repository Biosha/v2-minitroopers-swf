/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/components/**/*.{html,ts}",
    "./src/app/layouts/**/*.{html,ts}",
    "./src/app/pages/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        body: "#d19946",
        content: "#f2ddb8",
        contentlight: "#fdf4e4",
        bluecontainer: "#b4c4d8",
        textdescription: "#6b4320",
      },
      width: {
        contentsm: "95%",
        contentxl: "972px",
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
