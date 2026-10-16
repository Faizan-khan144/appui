import { Readable } from "node:stream";

const GROQ = "https://api.groq.com/openai/v1/chat/completions";
const POLLINATIONS = "https://text.pollinations.ai/openai";
const GROQ_DEFAULT = "llama-3.3-70b-versatile";
const POLL_DEFAULT = "openai";

const POLL_MAP = {
  "llama-3.3-70b-versatile": "openai",
  "llama-3.1-8b-instant": "openai-fast",
  "openai/gpt-oss-120b": "openai",
  "openai/gpt-oss-20b": "openai-fast",
  "qwen/qwen3-32b": "openai",
  "moonshotai/kimi-k2-instruct": "openai",
};

// Sticky provider: starts on groq if a key exists, but demotes to the
// keyless free backend the moment Groq rejects the key.
let PROVIDER = process.env.GROQ_API_KEY ? "groq" : "free";

export function backendInfo() {
  return {
    provider: PROVIDER,
    live: true,
    keyless: PROVIDER === "free",
    defaultModel: PROVIDER === "groq" ? GROQ_DEFAULT : POLL_DEFAULT,
  };
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function callUpstream(body, provider) {
  const groq = provider === "groq";
  const model = groq ? body.model || GROQ_DEFAULT : POLL_MAP[body.model] || POLL_DEFAULT;
  const headers = { "Content-Type": "application/json" };
  if (groq) headers.Authorization = `Bearer ${process.env.GROQ_API_KEY}`;

  return fetch(groq ? GROQ : POLLINATIONS, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: body.messages,
      stream: body.stream !== false,
      temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
      max_tokens: body.max_tokens || 2048,
    }),
  });
}

export async function handleChat(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });

  const body = await readBody(req);
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return send(res, 400, { error: "messages[] is required" });
  }

  let upstream;
  try {
    upstream = await callUpstream(body, PROVIDER);

    if (PROVIDER === "groq" && (upstream.status === 401 || upstream.status === 403)) {
      PROVIDER = "free";
      upstream = await callUpstream(body, "free");
    } else if (PROVIDER === "free" && upstream.status >= 400) {
      upstream = await callUpstream(body, "free");
    }
  } catch (err) {
    return send(res, 502, { error: "Upstream unreachable: " + (err?.message || err) });
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    res.statusCode = upstream.status;
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    return res.end(text || JSON.stringify({ error: "Upstream error " + upstream.status }));
  }

  res.statusCode = 200;
  res.setHeader(
    "Content-Type",
    upstream.headers.get("content-type") || "text/event-stream; charset=utf-8"
  );
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("X-Appui-Backend", PROVIDER);

  if (!upstream.body) return res.end();
  Readable.fromWeb(upstream.body).pipe(res);
}

export async function handleModels(_req, res) {
  send(res, 200, {
    ...backendInfo(),
    models: [
      { id: "openai", name: "GPT-OSS 20B" },
      { id: "openai-fast", name: "GPT-OSS 20B (fast)" },
    ],
  });
}
