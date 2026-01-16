import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawTarget =
    env.VITE_DEVICE_API_PROXY_TARGET ||
    env.VITE_DEVICE_API_URL ||
    env.VITE_API_URL ||
    "http://127.0.0.1:5001";
  const target = rawTarget.replace(/\/api\/?$/, "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
