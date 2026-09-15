import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy untuk menghindari CORS saat hit API hari libur dari browser
      "/holiday-api": {
        target: "https://use.api.co.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/holiday-api/, ""),
      },
    },
  },
});
