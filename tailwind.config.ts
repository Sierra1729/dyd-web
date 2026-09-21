import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        inter: ['"Inter"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        navy: "var(--navy)",
        "navy-mid": "var(--navy-mid)",
        "navy-lt": "var(--navy-lt)",
        sky: "var(--sky)",
        bg: "var(--bg)",
        gold: "var(--gold)",
        crimson: "var(--crimson)",
        text: "var(--text)",
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--navy-mid)",
        background: "var(--bg)",
        foreground: "var(--text)",
        primary: {
          DEFAULT: "var(--navy)",
          foreground: "var(--white)",
        },
        secondary: {
          DEFAULT: "var(--sky)",
          foreground: "var(--navy)",
        },
        destructive: {
          DEFAULT: "var(--crimson)",
          foreground: "var(--white)",
        },
        muted: {
          DEFAULT: "var(--sky)",
          foreground: "var(--muted)",
        },
        accent: {
          DEFAULT: "var(--navy-mid)",
          foreground: "var(--white)",
        },
        popover: {
          DEFAULT: "var(--white)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--white)",
          foreground: "var(--text)",
        },
        sidebar: {
          DEFAULT: "var(--bg)",
          foreground: "var(--text)",
          primary: "var(--navy)",
          "primary-foreground": "var(--white)",
          accent: "var(--sky)",
          "accent-foreground": "var(--navy)",
          border: "var(--border)",
          ring: "var(--navy-mid)",
        },
        'deep-slate': "var(--text)",
        'electric-blue': "var(--navy-mid)",
        'ghost-white': "var(--bg)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "levitate": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.02)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "levitate": "levitate 5s ease-in-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
