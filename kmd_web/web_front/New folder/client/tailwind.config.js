export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: { extend: {} },
  plugins: [],
}
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "border-amber-500",
    "border-blue-500",
    "border-cyan-500",
    "border-red-500",
    "border-yellow-500",
    "border-orange-500",
    "text-amber-500",
    "text-blue-500",
    "text-cyan-500",
    "text-red-500",
    "text-yellow-500",
    "text-orange-500",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
module.exports = {
  plugins: [require('@tailwindcss/line-clamp')],
};