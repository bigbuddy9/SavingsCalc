import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#262626",
          muted: "#525252",
          subtle: "#737373",
          faint: "#A3A3A3",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#FAFAFA",
          sunken: "#F2F2EF",
        },
        line: {
          DEFAULT: "#E7E5E4",
          strong: "#D6D3D1",
        },
        pain: {
          DEFAULT: "#E11D48",
          soft: "#FEE2E2",
          ink: "#9F1239",
        },
        gain: {
          DEFAULT: "#059669",
          soft: "#D1FAE5",
          ink: "#065F46",
        },
        edit: {
          DEFAULT: "#FEF9C3",
          ring: "#FACC15",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
        },
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
      },
      fontSize: {
        display: ["clamp(2.25rem, 4.2vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        h2: ["clamp(1.75rem, 2.6vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(10 10 10 / 0.04), 0 1px 3px 0 rgb(10 10 10 / 0.04)",
        elev: "0 4px 24px -4px rgb(10 10 10 / 0.08), 0 2px 6px -2px rgb(10 10 10 / 0.04)",
        focus: "0 0 0 4px rgb(250 204 21 / 0.35)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [animate],
};
