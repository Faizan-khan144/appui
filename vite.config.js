import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { handleChat, handleModels } from "./server/ai.js";

function apiBackend() {
  const mount = (middlewares) => {
    middlewares.use("/api/ai/chat", (req, res) => {
      handleChat(req, res).catch((err) => {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: String(err?.message || err) }));
      });
    });
    middlewares.use("/api/ai/models", (req, res) => {
      handleModels(req, res).catch(() => {});
    });
  };
  return {
    name: "appui-api-backend",
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY;

  return {
    define: {
      __HAS_KEY__: JSON.stringify(Boolean(env.GROQ_API_KEY)),
      __DEFAULT_MODEL__: JSON.stringify(env.VITE_MODEL || "llama-3.3-70b-versatile"),
    },
    plugins: [react(), tailwindcss(), apiBackend()],
  };
});
