
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#86A789",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#E9E5D6",
          foreground: "#464E47",
        },
        accent: {
          DEFAULT: "#464E47",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#F8F9FA",
          foreground: "#6B7280",
        },
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "swipe-right": {
          "0%": { transform: "translateX(0) rotate(0)", opacity: "1" },
          "100%": { transform: "translateX(200%) rotate(30deg)", opacity: "0" },
        },
        "swipe-left": {
          "0%": { transform: "translateX(0) rotate(0)", opacity: "1" },
          "100%": { transform: "translateX(-200%) rotate(-30deg)", opacity: "0" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "swipe-right": "swipe-right 0.5s ease-out",
        "swipe-left": "swipe-left 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
