import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { MODELS, modelById } from "../lib/models";

export default function ModelMenu({ value, onChange, align = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const active = modelById(value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn h-9 gap-2 px-3 text-[13px]"
        title="Choose model"
      >
        <span className="font-medium">{active.name}</span>
        <ChevronDown size={15} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`card fade-in absolute bottom-11 z-30 w-72 p-1.5 shadow-[var(--shadow)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Groq models
          </div>
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onChange(m.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-[var(--surface-2)]"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  {m.name}
                  <span className="rounded-full border border-[var(--border)] px-1.5 py-px text-[10px] font-normal text-[var(--muted)]">
                    {m.tag}
                  </span>
                </span>
                <span className="block truncate text-[11.5px] text-[var(--muted)]">
                  {m.desc}
                </span>
              </span>
              {value === m.id && <Check size={16} className="shrink-0 text-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
