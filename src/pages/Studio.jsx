import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Shuffle,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import Mascot from "../components/Mascot";
import MascotBuddy from "../components/MascotBuddy";
import { demoImagePrompt } from "../lib/demo";
import { useTheme } from "../lib/theme";

const GROUPS = [
  { key: "style", label: "Style", items: ["Photorealistic", "Cinematic", "3D render", "Anime", "Illustration", "Oil painting", "Watercolor", "Minimal", "Vintage", "Cyberpunk"] },
  { key: "lighting", label: "Lighting", items: ["Golden hour", "Blue hour", "Soft studio", "Dramatic", "Neon glow", "Overcast", "Backlit"] },
  { key: "lens", label: "Camera", items: ["35mm", "50mm", "85mm", "Macro", "Wide 24mm", "Telephoto", "Drone"] },
  { key: "mood", label: "Mood", items: ["Serene", "Bold", "Dreamy", "Melancholic", "Playful", "Epic", "Mysterious"] },
  { key: "palette", label: "Palette", items: ["Teal & orange", "Monochrome", "Pastel", "Earth", "Neon", "Sepia"] },
  { key: "aspect", label: "Ratio", items: ["1:1", "3:2", "2:3", "16:9", "9:16", "4:5"] },
  { key: "targetModel", label: "Model", items: ["Midjourney", "DALL·E", "Stable Diffusion", "Flux"] },
];

const IDEAS = [
  "A lighthouse on a cliff in a storm at dusk",
  "A cozy bookshop interior with rain outside",
  "A vintage sports car parked on a mountain road",
  "A cyberpunk street market full of neon signs",
  "An astronaut tending a garden on Mars",
  "A samurai standing in falling cherry blossoms",
];

const PRESETS = {
  Portrait: { style: "Photorealistic", lighting: "Soft studio", lens: "85mm", mood: "Serene", palette: "Monochrome", aspect: "4:5", targetModel: "Midjourney" },
  Landscape: { style: "Cinematic", lighting: "Golden hour", lens: "Wide 24mm", mood: "Epic", palette: "Teal & orange", aspect: "16:9", targetModel: "Midjourney" },
  Product: { style: "3D render", lighting: "Soft studio", lens: "Macro", mood: "Bold", palette: "Pastel", aspect: "1:1", targetModel: "Flux" },
  Fantasy: { style: "Illustration", lighting: "Dramatic", lens: "35mm", mood: "Mysterious", palette: "Neon", aspect: "3:2", targetModel: "Stable Diffusion" },
  Anime: { style: "Anime", lighting: "Blue hour", lens: "50mm", mood: "Playful", palette: "Pastel", aspect: "9:16", targetModel: "Midjourney" },
};

const HISTORY_KEY = "appui.prompts";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function Studio() {
  useTheme();
  const [idea, setIdea] = useState(IDEAS[0]);
  const [opts, setOpts] = useState({ ...PRESETS.Landscape });
  const [negative, setNegative] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(() => loadHistory());

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    } catch {
      /* ignore */
    }
  }, [history]);

  const raw = useMemo(() => (idea.trim() ? demoImagePrompt(idea, opts) : ""), [idea, opts]);

  const prompt = useMemo(() => {
    if (negative) return raw;
    return raw.split("\n").filter((l) => !/^Negative:/i.test(l.trim())).join("\n").trim();
  }, [raw, negative]);

  const toggle = (k, v) => setOpts((o) => ({ ...o, [k]: o[k] === v ? "" : v }));
  const applyPreset = (name) => setOpts({ ...PRESETS[name] });

  const surprise = () => {
    const next = {};
    GROUPS.forEach((g) => (next[g.key] = rnd(g.items)));
    setIdea(rnd(IDEAS));
    setOpts(next);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const save = () => {
    if (!prompt) return;
    setHistory((h) => [{ id: Date.now(), idea, opts, prompt }, ...h].slice(0, 30));
  };

  const sendToChat = () => {
    sessionStorage.setItem("appui.draft", JSON.stringify({ idea, opts }));
    window.location.href = "/chat";
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5">
          <Link to="/" className="icon-btn" title="Back">
            <ArrowLeft size={18} />
          </Link>
          <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-xl bg-[var(--surface-2)]">
            <Mascot size={24} sparkle={false} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold">Prompt studio</h1>
            <p className="text-[11.5px] text-[var(--muted)]">
              Build a polished image prompt, offline
            </p>
          </div>
          <button onClick={surprise} className="btn h-9 gap-2 px-3 text-[13px]">
            <Shuffle size={14} /> <span className="hidden sm:inline">Surprise</span>
          </button>
          <button onClick={sendToChat} disabled={!prompt} className="btn btn-primary h-9 gap-2 px-3 text-[13px]">
            <Wand2 size={14} /> Refine
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-7 lg:grid-cols-[1fr_1fr]">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <span className="block text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Presets
            </span>
          </div>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {Object.keys(PRESETS).map((p) => (
              <button key={p} className="chip" onClick={() => applyPreset(p)}>
                {p}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Your idea
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            className="field resize-none leading-relaxed"
            placeholder="What should the image be?"
          />

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {IDEAS.map((i) => (
              <button key={i} className="chip" onClick={() => setIdea(i)}>
                {i.split(" ").slice(0, 4).join(" ")}…
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {GROUPS.map((g) => (
              <div key={g.key}>
                <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {g.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((it) => (
                    <button
                      key={it}
                      className={`chip ${opts[g.key] === it ? "active" : ""}`}
                      onClick={() => toggle(g.key, it)}
                    >
                      {it}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="flex items-center justify-between">
              <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Generated prompt
              </span>
              <span className="text-[11.5px] text-[var(--muted)]">{prompt.length} chars</span>
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted)]">
                  <Sparkles size={13} /> {opts.targetModel || "Midjourney"}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNegative((n) => !n)}
                    className={`btn h-7 gap-1.5 px-2.5 text-[12px] ${
                      negative ? "border-[var(--accent)] text-[var(--text)]" : ""
                    }`}
                    title="Include negative prompt"
                  >
                    Negative: {negative ? "on" : "off"}
                  </button>
                  <button onClick={save} disabled={!prompt} className="btn h-7 gap-1.5 px-2.5 text-[12px]">
                    <Bookmark size={13} /> Save
                  </button>
                  <button onClick={copy} className="btn h-7 gap-1.5 px-2.5 text-[12px]">
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <pre className="mono max-h-[420px] overflow-auto whitespace-pre-wrap p-4 text-[13px] leading-[1.7] text-[var(--text)]">
                {prompt || "Start typing an idea…"}
              </pre>
            </div>

            <button onClick={sendToChat} disabled={!prompt} className="btn btn-primary mt-3 w-full">
              <Wand2 size={15} /> Refine it in chat
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="block text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Saved prompts {history.length > 0 && <span className="text-[var(--muted)]">({history.length})</span>}
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11.5px] text-[var(--muted)] hover:text-[var(--text)]"
                >
                  Clear
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="card px-3.5 py-3 text-[12.5px] leading-relaxed text-[var(--muted)]">
                Nothing saved yet. Hit <span className="text-[var(--text)]">Save</span> to keep a
                prompt here and reuse it later.
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="card group flex items-start gap-2 px-3 py-2.5">
                    <button
                      onClick={() => {
                        setIdea(h.idea);
                        setOpts({ ...h.opts });
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="line-clamp-1 block text-[13px] font-medium">{h.idea}</span>
                      <span className="line-clamp-1 block text-[11.5px] text-[var(--muted)]">
                        {h.prompt}
                      </span>
                    </button>
                    <button
                      onClick={() => setHistory((prev) => prev.filter((x) => x.id !== h.id))}
                      className="icon-btn h-7 w-7 shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <MascotBuddy floating size={88} />
    </div>
  );
}
