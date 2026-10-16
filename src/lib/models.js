export const MODELS = [
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    tag: "Versatile",
    desc: "Best all-rounder for chat",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    tag: "Instant",
    desc: "Fastest, light replies",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    tag: "Reasoning",
    desc: "Deep reasoning tasks",
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    tag: "Quick",
    desc: "Fast and capable",
  },
  {
    id: "qwen/qwen3-32b",
    name: "Qwen3 32B",
    tag: "Multilingual",
    desc: "Strong across languages",
  },
  {
    id: "moonshotai/kimi-k2-instruct",
    name: "Kimi K2",
    tag: "Long context",
    desc: "Great for long documents",
  },
];

export function modelById(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}

export const DEFAULT_MODEL =
  typeof __DEFAULT_MODEL__ !== "undefined" ? __DEFAULT_MODEL__ : "llama-3.3-70b-versatile";

export const HAS_KEY = typeof __HAS_KEY__ !== "undefined" ? __HAS_KEY__ : false;
