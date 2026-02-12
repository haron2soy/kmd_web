import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host:true,
    port: 5173, // Vite dev server port
    proxy: {
      // Proxy any request starting with /api to Nginx backend
      "/api": {
        target: "http://localhost", // Nginx (port 80)
        changeOrigin: true,
        secure: false,
        
      },

    },
    strictPort:true,
    allowedHosts: ['rsmc.test', 'localhost'],
  },
});
