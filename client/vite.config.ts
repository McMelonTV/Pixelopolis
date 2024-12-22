import {defineConfig} from 'vite';
import deno from "@deno/vite-plugin";
import react from '@vitejs/plugin-react'; // https://vitejs.dev/config/

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "../",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5417",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: {
      clientPort: 443,
    },
  },
  plugins: [
    deno(),
    react(),
  ],
});
