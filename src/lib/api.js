import { demoReply, demoStream } from "./demo";

const ENDPOINT = "/api/ai/chat";

let backendDown = false;

export function isLive() {
  return !backendDown;
}

function prettyError(status, body) {
  let detail = "";
  try {
    detail = JSON.parse(body)?.error?.message || JSON.parse(body)?.error || "";
  } catch {
    detail = (body || "").slice(0, 180);
  }
  if (status === 429) return "Too many requests right now. Give it a moment and try again.";
  if (status === 400) return `The model could not process that request. ${detail}`;
  if (status === 402) return "That model needs a paid key — Appui is using the free backend instead.";
  if (status >= 500) return "The backend is having trouble right now. Try again shortly.";
  return `Request failed (${status}). ${detail}`;
}

async function runDemo(messages, onToken, signal) {
  const text = demoReply(messages);
  for await (const t of demoStream(text, signal)) onToken(t);
  return text;
}

export async function streamChat({ messages, model, onToken, signal }) {
  try {
    return await realStream({ messages, model, onToken, signal });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    if (err?.status === 0 || err?.name === "TypeError") backendDown = true;
    if (backendDown) return runDemo(messages, onToken, signal);
    throw err;
  }
}

async function realStream({ messages, model, onToken, signal }) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
      signal,
    });
  } catch (err) {
    const error = new Error("Could not reach the backend. Is the dev server running?");
    error.status = 0;
    throw error;
  }

  if (!res.ok) {
    const error = new Error(prettyError(res.status, await res.text().catch(() => "")));
    error.status = res.status;
    throw error;
  }

  backendDown = false;
  return readSse(res, onToken, signal);
}

async function readSse(res, onToken, signal) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onToken(delta);
        }
      } catch {
        /* partial chunk */
      }
    }
  }
  return full;
}

export async function chatOnce({ messages, model, max_tokens = 60 }) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens, stream: false }),
    });
    if (!res.ok) throw new Error("title failed");
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || "New chat";
  } catch {
    const last = [...messages].reverse().find((m) => m.role === "user");
    const words = (last?.content || "New chat").trim().split(/\s+/).slice(0, 4).join(" ");
    return words.replace(/[^\w\s]/g, "") || "New chat";
  }
}
