import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  Check,
  Copy,
  Download,
  PanelLeft,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Message from "../components/Message";
import Composer from "../components/Composer";
import MascotBuddy from "../components/MascotBuddy";
import { streamChat, chatOnce, isLive } from "../lib/api";
import { CHAT_SYSTEM, IMAGE_SYSTEM, buildImageRequest, TITLE_SYSTEM } from "../lib/prompt";
import { DEFAULT_MODEL } from "../lib/models";
import { useTheme } from "../lib/theme";
import { loadChats, saveChats, newChat, uid } from "../lib/storage";

const SUGGESTIONS = [
  { icon: "💡", text: "Explain async/await with a small code example" },
  { icon: "✉️", text: "Draft a polite follow-up email" },
  { icon: "✅", text: "Turn my notes into a checklist" },
  { icon: "🏔️", text: "Plan a 3-day trip to Hunza" },
  { icon: "🎨", text: "Write an image prompt for a cosy bookshop" },
  { icon: "🐛", text: "Why is my React component re-rendering?" },
];

export default function Chat() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const navigate = useNavigate();
  const [chats, setChats] = useState(() => loadChats());
  const [activeId, setActiveId] = useState(() => loadChats()[0]?.id || null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("chat");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [imageOpts, setImageOpts] = useState({ aspect: "1:1", targetModel: "Midjourney" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [focusKey, setFocusKey] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);

  const abortRef = useRef(null);
  const accRef = useRef("");
  const scrollRef = useRef(null);

  const active = useMemo(() => chats.find((c) => c.id === activeId) || null, [chats, activeId]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom) el.scrollTop = el.scrollHeight;
  }, [active?.messages, busy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (active) {
      setMode(active.mode || "chat");
      setModel(active.model || DEFAULT_MODEL);
    }
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        startNew();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (id, fn) =>
    setChats((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 120);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const startNew = () => {
    abortRef.current?.abort();
    setActiveId(null);
    setSidebarOpen(false);
    setMode("chat");
    setDraft("");
    setFocusKey((k) => k + 1);
  };

  const remove = (id) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeId) setActiveId(next[0]?.id || null);
      return next;
    });
  };

  const clearActive = () => {
    if (!active) return;
    abortRef.current?.abort();
    update(active.id, (c) => ({ ...c, messages: [], updatedAt: Date.now() }));
  };

  const asMarkdown = (chat) =>
    chat.messages
      .filter((m) => !m.error)
      .map((m) => `**${m.role === "user" ? "You" : "Appui"}:**\n\n${m.content}`)
      .join("\n\n---\n\n");

  const exportChat = () => {
    if (!active) return;
    const blob = new Blob([`# ${active.title || "Appui chat"}\n\n${asMarkdown(active)}`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(active.title || "appui-chat").replace(/[^\w\-]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(asMarkdown(active));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const run = async (chat, apiMessages) => {
    setBusy(true);
    accRef.current = "";
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const asst = chat.messages[chat.messages.length - 1];

    try {
      const full = await streamChat({
        messages: apiMessages,
        model: chat.model,
        signal: ctrl.signal,
        onToken: (t) => {
          accRef.current += t;
          update(chat.id, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === asst.id ? { ...m, content: accRef.current } : m
            ),
          }));
        },
      });
      update(chat.id, (c) => ({
        ...c,
        updatedAt: Date.now(),
        messages: c.messages.map((m) => (m.id === asst.id ? { ...m, content: full } : m)),
      }));
      return { ok: true, full };
    } catch (err) {
      const aborted = err?.name === "AbortError";
      const text = aborted ? accRef.current || "Stopped." : err?.message || "Something went wrong.";
      update(chat.id, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === asst.id ? { ...m, content: text, error: !aborted } : m
        ),
      }));
      return { ok: false, full: accRef.current };
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  const buildApiMessages = (chat) => [
    { role: "system", content: chat.mode === "image" ? IMAGE_SYSTEM : CHAT_SYSTEM },
    ...chat.messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.role === "user" ? m.api || m.content : m.content })),
  ];

  const send = async (text, baseChat) => {
    if (busy) return;
    const apiText = mode === "image" ? buildImageRequest(text, imageOpts) : text;
    const now = Date.now();
    const userMsg = { id: uid(), role: "user", content: text, api: apiText, ts: now };
    const asstMsg = { id: uid(), role: "assistant", content: "", ts: now };

    let chat = baseChat || active;
    if (!chat) {
      chat = { ...newChat(model), mode };
      setChats((prev) => [chat, ...prev]);
      setActiveId(chat.id);
    }

    const next = {
      ...chat,
      mode,
      model,
      updatedAt: now,
      messages: [...chat.messages, userMsg, asstMsg],
    };
    setChats((prev) =>
      prev.some((c) => c.id === next.id)
        ? prev.map((c) => (c.id === next.id ? next : c))
        : [next, ...prev]
    );

    const first = next.messages.length === 2 && mode === "chat";
    await run(next, buildApiMessages(next));

    if (first) {
      try {
        const title = await chatOnce({
          model,
          messages: [
            { role: "system", content: TITLE_SYSTEM },
            { role: "user", content: text },
          ],
        });
        const clean = title.replace(/^["']|["'.!?]+$/g, "").trim();
        if (clean) update(next.id, (c) => ({ ...c, title: clean.slice(0, 48) }));
      } catch {
        /* title is optional */
      }
    }
  };

  const editResend = (msg) => {
    if (busy || !active) return;
    const idx = active.messages.findIndex((m) => m.id === msg.id);
    if (idx < 0) return;
    const trimmed = active.messages.slice(0, idx);
    const next = { ...active, updatedAt: Date.now(), messages: trimmed };
    setChats((prev) => prev.map((c) => (c.id === next.id ? next : c)));
    setDraft(msg.content);
    setFocusKey((k) => k + 1);
  };

  const regenerate = async () => {
    if (busy || !active) return;
    const msgs = active.messages;
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx < 0) return;

    const trimmed = msgs.slice(0, lastUserIdx + 1);
    const asstMsg = { id: uid(), role: "assistant", content: "", ts: Date.now() };
    const next = { ...active, updatedAt: Date.now(), messages: [...trimmed, asstMsg] };
    setChats((prev) => prev.map((c) => (c.id === next.id ? next : c)));
    await run(next, buildApiMessages(next));
  };

  const hasMessages = active && active.messages.length > 0;
  const lastIsAssistant =
    hasMessages && active.messages[active.messages.length - 1].role === "assistant";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar
        chats={chats}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onNew={startNew}
        onDelete={remove}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        accent={accent}
        setAccent={setAccent}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
          <button
            className="icon-btn md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <PanelLeft size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold">{active?.title || "New chat"}</h1>
            <p className="flex items-center gap-1.5 truncate text-[11.5px] text-[var(--muted)]">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  isLive() ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {isLive()
                ? mode === "image"
                  ? "Image prompt mode"
                  : "Live · free backend"
                : "Offline — reconnecting"}
            </p>
          </div>

          {hasMessages && (
            <div className="flex items-center gap-1">
              <button onClick={copyAll} className="icon-btn h-8 w-8" title="Copy entire chat">
                {copiedAll ? <Check size={15} /> : <Copy size={15} />}
              </button>
              <button onClick={exportChat} className="icon-btn h-8 w-8" title="Export as Markdown">
                <Download size={15} />
              </button>
              <button onClick={clearActive} className="icon-btn h-8 w-8" title="Clear messages">
                <Trash2 size={15} />
              </button>
            </div>
          )}

          <Link to="/studio" className="btn hidden h-8 gap-1.5 px-2.5 text-[12.5px] sm:flex">
            <Sparkles size={14} /> Studio
          </Link>
          <button onClick={startNew} className="btn btn-primary h-8 gap-1.5 px-2.5 text-[12.5px]">
            <Plus size={14} /> New
          </button>
        </header>

        <div className="relative min-h-0 flex-1">
          <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto">
            <div className="mx-auto max-w-[46rem] px-4 py-6">
              {!hasMessages ? (
                <div className="flex min-h-[62vh] flex-col items-center justify-center text-center">
                  <MascotBuddy
                    size={120}
                    onNewChat={startNew}
                    onInsert={(t) => {
                      setDraft(t);
                      setFocusKey((k) => k + 1);
                    }}
                    onOpenStudio={() => navigate("/studio")}
                  />
                  <h2 className="mt-6 text-2xl font-bold tracking-tight">
                    Hey, I'm <span className="grad-text">Appui</span>
                  </h2>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--muted)]">
                    Ask me anything, or switch to <span className="text-[var(--text)]">Image
                    prompt</span> mode and I'll turn a rough idea into a ready-to-paste prompt.
                  </p>
                  <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.text}
                        onClick={() => send(s.text)}
                        className="card flex items-center gap-3 px-3.5 py-3 text-left text-[13px] leading-snug text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                      >
                        <span className="text-[16px]">{s.icon}</span>
                        <span className="min-w-0">{s.text}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 text-[11.5px] text-[var(--muted)]">
                    Tip: press <kbd className="kbd">Ctrl</kbd> <kbd className="kbd">K</kbd> for a new
                    chat
                  </p>
                </div>
              ) : (
                <>
                  {active.messages.map((m, i) => (
                    <Message
                      key={m.id}
                      msg={m}
                      streaming={busy && i === active.messages.length - 1 && m.role === "assistant"}
                      showRegenerate={
                        !busy && lastIsAssistant && i === active.messages.length - 1
                      }
                      onRegenerate={regenerate}
                      onEdit={editResend}
                    />
                  ))}
                  <div className="h-4" />
                </>
              )}
            </div>
          </div>

          {!atBottom && hasMessages && (
            <button
              onClick={scrollToBottom}
              className="card absolute bottom-4 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full shadow-[var(--shadow)] transition hover:bg-[var(--surface-2)]"
              title="Scroll to latest"
            >
              <ArrowDown size={16} />
            </button>
          )}
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4">
          <div className="mx-auto max-w-[46rem]">
            <Composer
              onSend={send}
              busy={busy}
              onStop={() => abortRef.current?.abort()}
              mode={mode}
              setMode={setMode}
              imageOpts={imageOpts}
              setImageOpts={setImageOpts}
              model={model}
              setModel={setModel}
              value={draft}
              onValueChange={setDraft}
              focusKey={focusKey}
            />
          </div>
        </div>
      </main>

      <MascotBuddy
        floating
        size={92}
        onNewChat={startNew}
        onInsert={(t) => {
          setDraft(t);
          setFocusKey((k) => k + 1);
        }}
        onOpenStudio={() => navigate("/studio")}
      />
    </div>
  );
}
