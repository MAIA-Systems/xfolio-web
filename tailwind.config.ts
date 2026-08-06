import type { Config } from "tailwindcss";

/** Wraps a theme CSS variable so Tailwind's `/opacity` modifier keeps working. */
const hsl = (variable: string) => `hsl(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: hsl("--background"),
        foreground: hsl("--foreground"),
        border: hsl("--border"),
        input: hsl("--input"),
        ring: hsl("--ring"),
        card: {
          DEFAULT: hsl("--card"),
          foreground: hsl("--card-foreground"),
          border: hsl("--card-border"),
        },
        popover: {
          DEFAULT: hsl("--popover"),
          foreground: hsl("--popover-foreground"),
          border: hsl("--popover-border"),
        },
        primary: {
          DEFAULT: hsl("--primary"),
          foreground: hsl("--primary-foreground"),
          border: hsl("--primary-border"),
        },
        secondary: {
          DEFAULT: hsl("--secondary"),
          foreground: hsl("--secondary-foreground"),
          border: hsl("--secondary-border"),
        },
        muted: {
          DEFAULT: hsl("--muted"),
          foreground: hsl("--muted-foreground"),
          border: hsl("--muted-border"),
        },
        accent: {
          DEFAULT: hsl("--accent"),
          foreground: hsl("--accent-foreground"),
          border: hsl("--accent-border"),
        },
        success: {
          DEFAULT: hsl("--success"),
          foreground: hsl("--success-foreground"),
        },
        destructive: {
          DEFAULT: hsl("--destructive"),
          foreground: hsl("--destructive-foreground"),
          border: hsl("--destructive-border"),
        },
        sidebar: {
          DEFAULT: hsl("--sidebar"),
          foreground: hsl("--sidebar-foreground"),
          border: hsl("--sidebar-border"),
          primary: hsl("--sidebar-primary"),
          "primary-foreground": hsl("--sidebar-primary-foreground"),
          accent: hsl("--sidebar-accent"),
          "accent-foreground": hsl("--sidebar-accent-foreground"),
          ring: hsl("--sidebar-ring"),
        },
        chart: {
          "1": hsl("--chart-1"),
          "2": hsl("--chart-2"),
          "3": hsl("--chart-3"),
          "4": hsl("--chart-4"),
          "5": hsl("--chart-5"),
        },
      },
      // Scaled off --radius (10px) to reproduce the original 3/4/6/9/12/16px steps.
      borderRadius: {
        DEFAULT: "calc(var(--radius) * 0.4)",
        sm: "calc(var(--radius) * 0.3)",
        md: "calc(var(--radius) * 0.6)",
        lg: "calc(var(--radius) * 0.9)",
        xl: "calc(var(--radius) * 1.2)",
        "2xl": "calc(var(--radius) * 1.6)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
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
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
