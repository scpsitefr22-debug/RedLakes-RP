import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@redlakes/narrative-core": path.resolve(__dirname, "../../packages/narrative-core/src/index.ts"),
    },
  },
  server: {
    port: 3020,
  },
});
