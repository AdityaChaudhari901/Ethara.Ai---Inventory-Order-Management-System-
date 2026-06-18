/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Industrial "freight terminal" palette.
        carbon: { DEFAULT: "#17181B", soft: "#23252A", line: "#34363C" },
        concrete: "#E6E6DF",
        hazard: { DEFAULT: "#FFC400", soft: "#FFF1C2", deep: "#8A5A00" },
        signal: { DEFAULT: "#E2462F", deep: "#A92C19" },
        go: { DEFAULT: "#1F8A52", deep: "#15623B" },
        paperline: "#D4D4C9",

        // Aliases kept so existing class names adopt the new palette.
        ink: { DEFAULT: "#17181B", soft: "#23252A", line: "#34363C", muted: "#6B6F76" },
        paper: "#E6E6DF",
        brand: { DEFAULT: "#FFC400", soft: "#FFF1C2", deep: "#8A5A00" },
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Hard offset "stamped" shadow — the industrial signature.
        hard: "4px 4px 0 0 #17181B",
        "hard-sm": "3px 3px 0 0 #17181B",
        panel: "0 1px 0 0 #D4D4C9",
      },
      borderRadius: {
        // Restrained radius — crisp, not pillowy.
        md: "5px",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "stamp-in": {
          "0%": { opacity: 0, transform: "translateY(6px) scale(0.99)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms cubic-bezier(0.2,0.7,0.2,1)",
        "stamp-in": "stamp-in 180ms cubic-bezier(0.2,0.7,0.2,1)",
      },
    },
  },
  plugins: [],
};
