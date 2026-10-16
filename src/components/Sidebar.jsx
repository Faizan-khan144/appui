import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  MessageSquarePlus,
  Moon,
  Search,
  Sun,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import Mascot from "./Mascot";
import { groupByDate } from "../lib/storage";
import { ACCENTS } from "../lib/theme";

export default function Sidebar({
  chats,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose,
  theme,
  toggleTheme,
  accent,
  setAccent,
}) {
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? chats.filter((c) =>
        (c.title + " " + c.messages.map((m) => m.content).join(" "))
          .toLowerCase()
          .includes(q.toLowerCase())
      )
    : chats;
  const groups = groupByDate(filtered);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-300 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[var(--surface-2)]">
              <Mascot size={30} sparkle={false} />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight">Appui</span>
          </Link>
          <button className="icon-btn md:hidden" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 px-3">
          <button
            onClick={onNew}
            className="btn btn-primary w-full justify-start gap-2.5"
          >
            <MessageSquarePlus size={17} />
            New chat
          </button>

          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search chats"
              className="field pl-9"
            />
          </div>
        </div>

        <nav className="mt-3 flex-1 overflow-y-auto px-2 pb-3">
          {groups.length === 0 && (
            <p className="px-3 py-6 text-center text-[13px] text-[var(--muted)]">
              No chats yet. Start a new one.
            </p>
          )}

          {groups.map((g) => (
            <div key={g.label} className="mb-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {g.label}
              </div>
              {g.items.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 transition ${
                    activeId === c.id
                      ? "bg-[var(--surface-3)]"
                      : "hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <button
                    onClick={() => onSelect(c.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      {c.mode === "image" && (
                        <Wand2 size={12} className="shrink-0 text-[var(--accent-2)]" />
                      )}
                      <span className="truncate text-[13.5px] font-medium">{c.title}</span>
                    </span>
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="icon-btn h-7 w-7 opacity-0 transition group-hover:opacity-100"
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Accent
            </span>
            <div className="flex items-center gap-1.5">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  title={a.name}
                  aria-label={`${a.name} theme`}
                  className={`h-5 w-5 rounded-full border transition ${
                    accent === a.id ? "scale-110 border-[var(--text)]" : "border-[var(--border)] hover:scale-105"
                  }`}
                  style={{ backgroundImage: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme} className="btn flex-1 justify-start gap-2 text-[13px]">
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <Link to="/" className="icon-btn h-9 w-9" title="Home">
              <Home size={17} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
