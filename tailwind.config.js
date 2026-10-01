/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040a14',
          900: '#050d1a',
          850: '#071325',
          800: '#0a182e',
          700: '#0f2445',
        },
        cyan: {
          neon: '#00e5ff',
          dim: '#00b4d8',
        }
      }
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
}
