import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Code2,
  Eye,
  Github,
  Hand,
  Image as ImageIcon,
  Keyboard,
  Layers,
  Menu,
  Minus,
  Moon,
  MousePointerClick,
  PartyPopper,
  Plus,
  Shield,
  Sparkles,
  Sun,
  Volume2,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import Mascot from "../components/Mascot";
import MascotBuddy from "../components/MascotBuddy";
import { useTheme, ACCENTS } from "../lib/theme";
import { isLive } from "../lib/api";

const STATS = [
  ["< 1s", "first token"],
  ["0", "sign-ups"],
  ["100%", "in-browser"],
  ["Free", "no key"],
];

const SKILLS = [
  { icon: MousePointerClick, t: "Boop", d: "Click for a hop and a little sound." },
  { icon: PartyPopper, t: "Double-click", d: "A spin and a burst of confetti." },
  { icon: Eye, t: "It watches", d: "Big eyes that follow your cursor." },
  { icon: Hand, t: "Pick & throw", d: "Drag it anywhere — it springs back." },
  { icon: Sparkles, t: "Idle antics", d: "Waves, dances and drops the odd tip." },
  { icon: Volume2, t: "Sound", d: "Soft cues on every action. Mute anytime." },
];

const FEATURES = [
  { icon: Zap, title: "Streaming answers", body: "Tokens arrive as they're written, so replies feel instant." },
  { icon: ImageIcon, title: "Image-prompt studio", body: "Turn a rough idea into a structured prompt for any generator." },
  { icon: Code2, title: "Real code blocks", body: "Syntax-highlighted, copyable, with language tags and formatting." },
  { icon: Wand2, title: "Tone & model", body: "Pick a persona and a model right from the composer." },
  { icon: Shield, title: "Private by default", body: "Your chats live in this browser. No account, no tracking." },
  { icon: Keyboard, title: "Keyboard-first", body: "Ctrl / Cmd + K for a new chat. Enter to send, Shift+Enter to break." },
];

const STEPS = [
  { n: "01", t: "Ask", d: "Type a question, a draft, a bug or a plan." },
  { n: "02", t: "Tune", d: "Switch tone or flip into Image-prompt mode in one click." },
  { n: "03", t: "Take it", d: "Copy the answer, the code or the prompt and move on." },
];

const PROMPTS = [
  {
    idea: "a lighthouse in a storm",
    prompt:
      "A solitary lighthouse on a jagged cliff during a violent storm at dusk, crashing waves, dramatic chiaroscuro, cinematic still, 35mm, teal and orange grade --ar 16:9 --style raw --v 6",
  },
  {
    idea: "cozy bookshop, rain",
    prompt:
      "A cosy bookshop interior at night with rain streaking the window, warm amber lamplight, overflowing wooden shelves, shallow depth of field, vintage film, fine grain --ar 3:2 --style raw --v 6",
  },
];

const FAQ = [
  {
    q: "Do I need an API key?",
    a: "No. Appui runs on a free hosted backend, so live answers work the moment you open it. There is nothing to configure.",
  },
  {
    q: "Where are my chats stored?",
    a: "In your browser's local storage, and nowhere else. The only thing that leaves your device is the single request to the model backend. Clearing site data clears your history.",
  },
  {
    q: "What can it actually do?",
    a: "Chat and reason, write and debug code, draft and edit text, and compose detailed image prompts tuned for Midjourney, DALL·E, Stable Diffusion or Flux.",
  },
  {
    q: "Is it really free?",
    a: "Yes. No tiers, no key, no sign-up. Open it and go.",
  },
];

function SectionLabel({ index, kicker }) {
  return (
    <div className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
      <span className="text-[var(--accent)]">{index}</span> — {kicker}
    </div>
  );
}

function AccentPicker({ accent, setAccent }) {
  return (
    <div className="flex items-center gap-1.5">
      {ACCENTS.map((a) => (
        <button
          key={a.id}
          onClick={() => setAccent(a.id)}
          title={a.name}
          aria-label={`${a.name} theme`}
          className={`h-4 w-4 rounded-full border transition ${
            accent === a.id ? "scale-125 border-[var(--text)]" : "border-[var(--border)] hover:scale-110"
          }`}
          style={{ backgroundImage: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const { theme, accent, setAccent, toggleTheme } = useTheme();
  const [menu, setMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    document.title = "Appui — AI chat & prompt studio";
  }, []);

  const nav = [
    ["#companion", "Companion"],
    ["#features", "Features"],
    ["#studio", "Studio"],
    ["#faq", "FAQ"],
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
              <Mascot size={24} sparkle={false} />
            </span>
            <span className="text-[17px] font-extrabold tracking-[-0.03em]">Appui</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {nav.map(([h, l]) => (
              <a
                key={h}
                href={h}
                className="rounded-lg px-3 py-2 text-[13.5px] text-[var(--muted)] transition hover:text-[var(--text)]"
              >
                {l}
              </a>
            ))}
          </nav>

          <div className="flex-1" />
          <div className="hidden sm:block">
            <AccentPicker accent={accent} setAccent={setAccent} />
          </div>
          <button onClick={toggleTheme} className="icon-btn" title="Toggle theme">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link to="/chat" className="btn btn-primary h-9 px-4 text-[13px]">
            Open Appui
          </Link>
          <button className="icon-btn lg:hidden" onClick={() => setMenu((m) => !m)} aria-label="Menu">
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-[var(--border)] px-5 py-3 lg:hidden">
            {nav.map(([h, l]) => (
              <a
                key={h}
                href={h}
                onClick={() => setMenu(false)}
                className="block rounded-lg px-3 py-2.5 text-[14px] text-[var(--text-soft)] hover:bg-[var(--surface-2)]"
              >
                {l}
              </a>
            ))}
            <div className="flex items-center justify-between px-3 pt-3">
              <span className="text-[12.5px] text-[var(--muted)]">Accent</span>
              <AccentPicker accent={accent} setAccent={setAccent} />
            </div>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rise">
              <div className="eyebrow">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isLive() ? "bg-emerald-400" : "bg-amber-400"}`}
                />
                {isLive() ? "Live — free backend, no key" : "Connecting…"}
              </div>

              <h1 className="mt-7 text-[clamp(2.6rem,6.2vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.045em]">
                Chat fast.
                <br />
                <span className="grad-text">Prompt better.</span>
              </h1>

              <p className="mt-6 max-w-lg text-[16.5px] leading-[1.75] text-[var(--muted)]">
                A lightweight AI assistant with a built-in image-prompt studio. Answers
                stream instantly, there's no key to enter, and your history never leaves
                the browser.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/chat" className="btn btn-primary btn-lg">
                  Start chatting <ArrowRight size={17} />
                </Link>
                <Link to="/studio" className="btn btn-lg">
                  Open the studio
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <Check size={13} className="text-[var(--accent)]" /> No account
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={13} className="text-[var(--accent)]" /> No API key
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={13} className="text-[var(--accent)]" /> Local history
                </span>
              </div>
            </div>

            <div className="rise" style={{ animationDelay: "0.08s" }}>
              <div className="card overflow-hidden shadow-[var(--shadow)]">
                <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                  <span className="mono text-[11px] text-[var(--muted)]">appui — new chat</span>
                  <span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-[var(--muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live
                  </span>
                </div>
                <div className="space-y-4 p-4">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[var(--surface-3)] px-3.5 py-2.5 text-[13.5px]">
                      Write a Midjourney prompt for a lighthouse in a storm
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                      <Mascot size={19} sparkle={false} mood="happy" />
                    </span>
                    <div className="mono rounded-xl border border-[var(--border)] bg-[var(--code-bg)] px-3.5 py-2.5 text-[11.5px] leading-[1.75] text-[var(--text-soft)]">
                      A solitary lighthouse on a jagged cliff during a violent storm at
                      dusk, crashing waves, dramatic chiaroscuro, cinematic still, 35mm,
                      teal and orange grade --ar 16:9 --style raw --v 6
                    </div>
                  </div>
                </div>
                <div className="border-t border-[var(--border)] p-3">
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5">
                    <span className="text-[13px] text-[var(--muted)]">Ask Appui anything…</span>
                    <div className="flex-1" />
                    <span
                      className="grid h-7 w-7 place-items-center rounded-lg"
                      style={{ background: "var(--grad)" }}
                    >
                      <ArrowRight size={14} color="#fff" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-y-8 border-t border-[var(--border)] pt-8 sm:grid-cols-4">
            {STATS.map(([v, l]) => (
              <div key={l}>
                <div className="text-[26px] font-extrabold tracking-tight">{v}</div>
                <div className="mono mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="companion" className="border-b border-[var(--border)] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
            <div>
              <SectionLabel index="01" kicker="Companion" />
              <h2 className="mt-3 text-[clamp(1.7rem,3.6vw,2.4rem)] font-bold tracking-[-0.03em]">
                A mascot you can actually play with
              </h2>
            </div>
            <p className="max-w-sm text-[14px] leading-relaxed text-[var(--muted)]">
              It follows you on every screen. Grab it, fling it, and it springs right back.
            </p>
          </div>

          <div className="mt-12 grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex items-center justify-center">
              <MascotBuddy size={220} />
            </div>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {SKILLS.map((s) => (
                <div key={s.t} className="flex gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                    <s.icon size={16} className="text-[var(--accent)]" />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold">{s.t}</div>
                    <div className="mt-0.5 text-[12.5px] leading-snug text-[var(--muted)]">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-[var(--border)] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="border-b border-[var(--border)] pb-6">
            <SectionLabel index="02" kicker="Capabilities" />
            <h2 className="mt-3 text-[clamp(1.7rem,3.6vw,2.4rem)] font-bold tracking-[-0.03em]">
              Small surface, sharp edges
            </h2>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-2xl border border-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`border-[var(--border)] p-6 transition hover:bg-[var(--surface-2)] ${
                  (i + 1) % 3 !== 0 ? "lg:border-r" : ""
                } ${i % 2 === 0 ? "sm:border-r" : ""} border-b`}
              >
                <f.icon size={19} className="text-[var(--accent)]" />
                <h3 className="mt-4 text-[15.5px] font-semibold">{f.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="studio" className="border-b border-[var(--border)] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
            <div>
              <SectionLabel index="03" kicker="Prompt studio" />
              <h2 className="mt-3 text-[clamp(1.7rem,3.6vw,2.4rem)] font-bold tracking-[-0.03em]">
                From idea to prompt in one pass
              </h2>
            </div>
            <Link to="/studio" className="btn h-10 px-4 text-[13.5px]">
              Open the studio <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {PROMPTS.map((e) => (
              <div key={e.idea} className="card overflow-hidden">
                <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-4">
                  <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    You type
                  </span>
                  <p className="mt-1.5 text-[15px]">“{e.idea}”</p>
                </div>
                <div className="px-5 py-4">
                  <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    Appui writes
                  </span>
                  <p className="mono mt-2 text-[12px] leading-[1.75] text-[var(--text-soft)]">
                    {e.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="border-b border-[var(--border)] pb-6">
            <SectionLabel index="04" kicker="Flow" />
            <h2 className="mt-3 text-[clamp(1.7rem,3.6vw,2.4rem)] font-bold tracking-[-0.03em]">
              Three steps, no friction
            </h2>
          </div>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="mono text-[12px] font-semibold text-[var(--accent)]">{s.n}</span>
                <h3 className="mt-4 text-[20px] font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-b border-[var(--border)] py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <SectionLabel index="05" kicker="FAQ" />
            <h2 className="mt-3 text-[clamp(1.7rem,3.6vw,2.4rem)] font-bold tracking-[-0.03em]">
              Questions, answered
            </h2>
            <div className="mt-6 flex items-center gap-2.5 text-[12.5px] text-[var(--muted)]">
              <Layers size={15} className="text-[var(--accent)]" />
              Built on a free, keyless backend.
            </div>
          </div>

          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-[15.5px] font-semibold">{f.q}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--border)]">
                    {openFaq === i ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="fade-in pb-6 pr-10 text-[14px] leading-relaxed text-[var(--muted)]">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-5 text-center">
          <MascotBuddy size={128} />
          <h2 className="mt-6 text-[clamp(2rem,4.4vw,3rem)] font-extrabold tracking-[-0.035em]">
            Say hi to <span className="grad-text">Appui</span>
          </h2>
          <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-[var(--muted)]">
            No account, no key, no wait. Just a fast assistant and a prompt studio,
            living in your browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/chat" className="btn btn-primary btn-lg">
              Open Appui <ArrowRight size={18} />
            </Link>
            <Link to="/studio" className="btn btn-lg">
              Try the studio
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Mascot size={24} sparkle={false} />
                <span className="text-[16px] font-extrabold tracking-tight">Appui</span>
              </div>
              <p className="mt-3 max-w-[230px] text-[13px] leading-relaxed text-[var(--muted)]">
                A small AI workspace — chat, prompt studio and a companion that follows along.
              </p>
            </div>
            <div>
              <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Product
              </div>
              <div className="mt-3 flex flex-col gap-2.5 text-[13.5px]">
                <Link to="/chat" className="text-[var(--text-soft)] transition hover:text-[var(--text)]">
                  Chat
                </Link>
                <Link to="/studio" className="text-[var(--text-soft)] transition hover:text-[var(--text)]">
                  Prompt studio
                </Link>
                <a href="#features" className="text-[var(--text-soft)] transition hover:text-[var(--text)]">
                  Features
                </a>
                <a href="#faq" className="text-[var(--text-soft)] transition hover:text-[var(--text)]">
                  FAQ
                </a>
              </div>
            </div>
            <div>
              <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Built with
              </div>
              <div className="mt-3 flex flex-col gap-2.5 text-[13.5px] text-[var(--text-soft)]">
                <span>React 19</span>
                <span>Vite 6</span>
                <span>Tailwind CSS 4</span>
                <span>Free keyless backend</span>
              </div>
            </div>
            <div>
              <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Elsewhere
              </div>
              <div className="mt-3 flex flex-col gap-2.5 text-[13.5px]">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[var(--text-soft)] transition hover:text-[var(--text)]"
                >
                  <Github size={15} /> GitHub
                </a>
                <Link to="/chat" className="text-[var(--text-soft)] transition hover:text-[var(--text)]">
                  Open Appui
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-[12.5px] text-[var(--muted)] sm:flex-row">
            <span>© {new Date().getFullYear()} Appui — built by Faizan.</span>
            <Link to="/chat" className="mono transition hover:text-[var(--text)]">
              open the app →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
