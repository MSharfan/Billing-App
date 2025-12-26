module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      transitionDuration: {
        DEFAULT: '200ms'
      },
      colors: {
        primary: "#0f1724",
        accent: "#06b6d4",
        card: "#0b1220"
      }
    }
  },
  plugins: []
}
