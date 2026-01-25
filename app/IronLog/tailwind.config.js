/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary": "#3b82f6", // Electric Blue
        "charcoal": "#0f1115",
        "card-dark": "#16181d",
        "field-dark": "#1f232c",
        "accent-orange": "#f97316"
      },
      fontFamily: {
        "display": ["Inter"]
      },
    },
  },
  plugins: [],
}
