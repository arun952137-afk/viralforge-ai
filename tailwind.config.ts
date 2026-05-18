import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Core palette — intentionally minimal
        canvas: {
          DEFAULT: "#07070F",
          50: "#0E0E1A",
          100: "#111120",
          200: "#16162A",
          300: "#1C1C30",
        },
        surface: {
          DEFAULT: "rgba(255,255,255,0.04)",
          hover: "rgba(255,255,255,0.07)",
          active: "rgba(255,255,255,0.10)",
          border: "rgba(255,255,255,0.07)",
          "border-strong": "rgba(255,255,255,0.14)",
        },
        ink: {
          DEFAULT: "#EEEEF8",
          secondary: "#8B8BA8",
          tertiary: "#4A4A64",
          disabled: "#2E2E44",
        },
        brand: {
          DEFAULT: "#6E42F5",
          light: "#8B62FF",
          dark: "#5530CC",
          glow: "rgba(110,66,245,0.25)",
        },
        accent: {
          teal: "#0DCCB5",
          amber: "#F5A623",
          rose: "#F5426E",
          sky: "#42B4F5",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(135deg, #6E42F5 0%, #42B4F5 100%)",
        "gradient-warm":
          "linear-gradient(135deg, #F5426E 0%, #F5A623 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #07070F 0%, #0E0E1A 100%)",
        "mesh-subtle":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(110,66,245,0.08) 0%, transparent 100%)",
      },
      boxShadow: {
        "brand-sm": "0 0 12px rgba(110,66,245,0.3)",
        "brand-md": "0 0 28px rgba(110,66,245,0.25)",
        "brand-lg": "0 0 60px rgba(110,66,245,0.2)",
        "surface-sm": "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
        "surface-md": "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        "surface-lg": "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "scale-in": "scaleIn 0.2s ease forwards",
        "slide-right": "slideRight 0.3s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 4s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        ticker: "ticker 20s linear infinite",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        slideRight: { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        glowPulse: { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        ticker: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem", "4xl": "2rem" },
      spacing: { "18": "4.5rem", "22": "5.5rem" },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [],
};

export default config;
