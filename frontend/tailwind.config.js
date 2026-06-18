/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Refined black / white / yellow system.
        carbon: { DEFAULT: "#141416", soft: "#26262B", line: "#33333A" },
        concrete: "#F3F3EF",
        hazard: { DEFAULT: "#FFC400", soft: "#FFF6D6", deep: "#8A5A00" },
        signal: { DEFAULT: "#E2462F", deep: "#A92C19" },
        go: { DEFAULT: "#1F8A52", deep: "#15623B" },
        paperline: "#E7E7E1",

        // Aliases so existing class names adopt the palette.
        ink: { DEFAULT: "#141416", soft: "#26262B", line: "#33333A", muted: "#8A8A8E" },
        paper: "#F3F3EF",
        brand: { DEFAULT: "#FFC400", soft: "#FFF6D6", deep: "#8A5A00" },
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,20,22,0.04), 0 16px 38px -20px rgba(20,20,22,0.22)",
        lift: "0 10px 26px -10px rgba(20,20,22,0.20)",
        glow: "0 8px 24px -8px rgba(255,196,0,0.55)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: 0, transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        grow: { from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 220ms cubic-bezier(0.2,0.7,0.2,1)",
        "pop-in": "pop-in 200ms cubic-bezier(0.2,0.7,0.2,1)",
      },
    },
  },
  plugins: [],
};
