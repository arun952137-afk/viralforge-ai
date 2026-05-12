import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
      colors: {
        background: '#070711',
        surface: '#13132a',
        surface2: '#1a1a38',
      },
      animation: {
        'glow': 'glow-pulse 2.5s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'fade-in-up': 'fadeInUp .4s ease both',
      },
    },
  },
  plugins: [],
}
export default config
