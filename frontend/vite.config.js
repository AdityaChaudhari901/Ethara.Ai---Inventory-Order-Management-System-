import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, calls to /api are proxied to the backend (the /api prefix is stripped
// so it maps to the backend's /products, /orders, ... routes). In production the
// API base URL comes from VITE_API_URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_TARGET || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
