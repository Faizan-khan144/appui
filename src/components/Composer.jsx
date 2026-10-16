import { useEffect, useRef, useState } from "react";
import { ArrowUp, ImagePlus, MessageSquare, Settings2, Square } from "lucide-react";
import ModelMenu from "./ModelMenu";

const OPTIONS = {
  style: {
    label: "Style",
    items: [
      "Photorealistic",
      "Cinematic",
      "3D render",
      "Anime",
      "Illustration",
      "Oil painting",
      "Watercolor",
      "Minimal",
      "Vintage",
      "Cyberpunk",
    ],
  },
  lighting: {
    label: "Lighting",
    items: [
      "Golden hour",
      "Blue hour",
      "Soft studio",
      "Dramatic",
      "Neon glow",
      "Overcast",
      "Backlit",
    ],
  },
  lens: {
    label: "Lens",
    items: ["35mm", "50mm", "85mm", "Macro", "Wide 24mm", "Telephoto", "Drone"],
  },
  mood: {
    label: "Mood",
    items: ["Serene", "Bold", "Dreamy", "Melancholic", "Playful", "Epic", "Mysterious"],
  },
  palette: { label: "Palette", items: ["Teal & orange", "Monochrome", "Pastel", "Earth", "Neon", "Sepia"] },
  aspect: { label: "Ratio", items: ["1:1", "3:2", "2:3", "16:9", "9:16", "4:5"] },
  targetModel: { label: "Model", items: ["Midjourney", "DALL·E", "Stable Diffusion", "Flux"] },
};

const IMAGE_PLACEHOLDER =
  "Describe your idea — e.g. a lighthouse on a cliff in a storm at dusk";

export default function Composer({
  onSend,
  busy,
  onStop,
  mode,
  setMode,
  imageOpts,
  setImageOpts,
  model,
  setModel,
  value: valueProp,
  onValueChange,
  focusKey = 0,
}) {
  const [inner, setInner] = useState("");
  const value = valueProp !== undefined ? valueProp : inner;
  const setValue = (v) => (onValueChange ? onValueChange(v) : setInner(v));
  const [showOpts, setShowOpts] = useState(false);
  const ta = useRef(null);

  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  useEffect(() => {
    if (focusKey > 0 && ta.current) {
      const el = ta.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [focusKey]);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
  };

  const setOpt = (k, v) => setImageOpts((o) => ({ ...o, [k]: o[k] === v ? "" : v }));

  return (
    <div className="space-y-2.5">
      {mode === "image" && showOpts && (
        <div className="card fade-in grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(OPTIONS).map(([key, def]) => (
            <div key={key} className="min-w-0">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {def.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {def.items.map((it) => (
                  <button
                    key={it}
                    className={`chip ${imageOpts[key] === it ? "active" : ""}`}
                    onClick={() => setOpt(key, it)}
                  >
                    {it}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(139,92,255,0.15)]">
        <textarea
          ref={ta}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={mode === "image" ? IMAGE_PLACEHOLDER : "Ask Appui anything…"}
          className="max-h-[200px] w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed outline-none placeholder:text-[var(--muted)]"
        />

        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5">
              <button
                onClick={() => setMode("chat")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition ${
                  mode === "chat"
                    ? "bg-[var(--surface-3)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <MessageSquare size={13} /> Chat
              </button>
              <button
                onClick={() => setMode("image")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition ${
                  mode === "image"
                    ? "bg-[var(--surface-3)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <ImagePlus size={13} /> Image prompt
              </button>
            </div>

            {mode === "image" && (
              <button
                onClick={() => setShowOpts((s) => !s)}
                className={`btn h-8 gap-1.5 px-2.5 text-[12.5px] ${
                  showOpts ? "border-[var(--accent)] text-[var(--text)]" : ""
                }`}
              >
                <Settings2 size={14} />
                <span className="hidden sm:inline">Options</span>
              </button>
            )}

            <ModelMenu value={model} onChange={setModel} />
          </div>

          {busy ? (
            <button onClick={onStop} className="btn h-9 gap-2 px-3">
              <Square size={13} fill="currentColor" />
              Stop
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!value.trim()}
              className="btn btn-primary h-9 w-9 !p-0"
              title="Send"
            >
              <ArrowUp size={17} />
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-[11.5px] text-[var(--muted)]">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}
