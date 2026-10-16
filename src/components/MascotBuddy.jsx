import { useCallback, useEffect, useRef, useState } from "react";
import Mascot from "./Mascot";
import { sfx, useSound } from "../lib/sound";
import {
  Lightbulb,
  Music2,
  PartyPopper,
  Shuffle,
  Sparkles,
  SlidersHorizontal,
  SquarePen,
  Volume2,
  VolumeX,
  Wand2,
} from "lucide-react";

const CONFETTI = ["#8b7cff", "#f472b6", "#22d3ee", "#fbbf24", "#34d399", "#fb7185"];

const SURPRISE = [
  "Explain async/await in JavaScript with a small example",
  "Write a polished image prompt for a cosy bookshop in the rain",
  "Draft a short, friendly follow-up email",
  "Plan a 3-day trip to Hunza on a small budget",
  "Give me 5 name ideas for a coffee brand",
  "Turn my messy notes into a clean checklist",
];

const BOOP_LINES = ["Boop!", "Hehe ~", "That tickles!", "Again, again!", "Hii!", "Nya~", "Eep!"];
const DANCE_LINES = ["Woo!", "Watch me go!", "Dance time!", "Yesss!"];
const FLY_LINES = ["Wheee!", "Catch me!", "Wheee ~", "I can fly!", "Weeeeee!"];
const LAND_LINES = ["Oof!", "I'm ok!", "Again!", "That was fun.", "Ha!"];
const TIPS = [
  "Switch models mid-chat with the dropdown.",
  "Try Image prompt mode — I love it.",
  "Throw me! Just flick and let go.",
  "Your chats stay in this browser.",
  "Double-click me for confetti!",
  "My eyes follow you. Creepy? Cute?",
  "The Prompt Studio is my favourite room.",
];

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const SPEED = 0.55;

export default function MascotBuddy({
  floating = false,
  size = 112,
  className = "",
  style,
  lines = BOOP_LINES,
  onNewChat,
  onInsert,
  onOpenStudio,
}) {
  const { muted, toggle } = useSound();
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [anim, setAnim] = useState("");
  const [mood, setMood] = useState("idle");
  const [flying, setFlying] = useState(false);
  const [say, setSay] = useState(null);
  const [bursts, setBursts] = useState([]);
  const [pos, setPos] = useState(null);
  const [hover, setHover] = useState(false);
  const [menu, setMenu] = useState(false);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [returning, setReturning] = useState(false);
  const natRef = useRef(null);

  const rootRef = useRef(null);
  const animTimer = useRef(null);
  const sayTimer = useRef(null);
  const mutedRef = useRef(muted);
  const rafRef = useRef(0);
  const drag = useRef(null);
  const vel = useRef({ x: 0, y: 0, lx: 0, ly: 0, lt: 0 });
  const moved = useRef(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (!floating) return;
    const s = size + 24;
    setPos({ x: Math.max(16, window.innerWidth - s - 20), y: Math.max(16, window.innerHeight - s - 20) });
  }, [floating, size]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const play = useCallback((name, ms = 900) => {
    setAnim("");
    requestAnimationFrame(() => {
      setAnim(name);
      clearTimeout(animTimer.current);
      animTimer.current = setTimeout(() => setAnim(""), ms);
    });
  }, []);

  const speak = useCallback((text, ms = 2600) => {
    setSay({ text, id: Date.now() });
    clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setSay(null), ms);
  }, []);

  const burst = useCallback((n = 12) => {
    const stamp = Date.now() + Math.random();
    const bits = Array.from({ length: n }, (_, i) => ({
      key: `${stamp}-${i}`,
      dx: `${(Math.random() - 0.5) * 180}px`,
      dy: `${-40 - Math.random() * 150}px`,
      rot: `${(Math.random() - 0.5) * 900}deg`,
      color: CONFETTI[i % CONFETTI.length],
      left: `${35 + Math.random() * 30}%`,
      top: `${35 + Math.random() * 30}%`,
      delay: `${Math.random() * 0.12}s`,
    }));
    setBursts((b) => [...b, ...bits]);
    setTimeout(() => setBursts((b) => b.filter((x) => !bits.some((y) => y.key === x.key))), 1200);
  }, []);

  // eyes follow the cursor
  useEffect(() => {
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = rootRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        setLook({
          x: Math.max(-1, Math.min(1, (e.clientX - cx) / 260)),
          y: Math.max(-1, Math.min(1, (e.clientY - cy) / 260)),
        });
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const boop = useCallback(() => {
    sfx.boop();
    play("hop", 660);
    setMood(Math.random() < 0.35 ? "happy" : "idle");
    speak(rnd(lines));
    burst(10);
  }, [lines, play, speak, burst]);

  const dance = useCallback(() => {
    sfx.giggle();
    setMood("happy");
    play("dance", 2200);
    speak(rnd(DANCE_LINES));
    burst(18);
  }, [play, speak, burst]);

  const spin = useCallback(() => {
    sfx.sparkle();
    play("spin", 900);
    burst(14);
  }, [play, burst]);

  const tip = useCallback(() => {
    sfx.pop();
    play("lean-right", 1500);
    speak(rnd(TIPS), 3400);
  }, [play, speak]);

  // physics throw (floating only)
  const fling = useCallback(
    (vx, vy) => {
      const clampV = (v) => Math.max(-46, Math.min(46, v));
      let px = clampV(vx * 16);
      let py = clampV(vy * 16);
      let x = pos?.x ?? 0;
      let y = pos?.y ?? 0;
      let bounces = 0;

      setAnim("");
      setFlying(true);
      setMood("wow");
      sfx.happy();
      speak(rnd(FLY_LINES), 1400);

      const step = () => {
        py += 0.85;
        x += px;
        y += py;
        px *= 0.992;
        const w = size;
        const h = size;
        const maxX = window.innerWidth - w - 8;
        const maxY = window.innerHeight - h - 8;

        if (x <= 8) {
          x = 8;
          px = -px * 0.62;
          sfx.pop();
        } else if (x >= maxX) {
          x = maxX;
          px = -px * 0.62;
          sfx.pop();
        }
        if (y <= 8) {
          y = 8;
          py = -py * 0.62;
        }
        if (y >= maxY) {
          y = maxY;
          if (Math.abs(py) > 3) sfx.pop();
          py = -py * 0.6;
          bounces++;
        }

        setPos({ x, y });

        const settled =
          y >= maxY - 0.5 && Math.abs(py) < 1.4 && Math.abs(px) < 0.5;
        if (settled) {
          setFlying(false);
          play("squish", 500);
          setMood("happy");
          if (bounces > 1) speak(rnd(LAND_LINES), 1600);
          return;
        }
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [pos, size, play, speak]
  );

  // random idle behaviours
  useEffect(() => {
    let t;
    const loop = () => {
      const wait = 8000 + Math.random() * 9000;
      t = setTimeout(() => {
        if (flying) return loop();
        const r = Math.random();
        if (r < 0.28) play("wave", 1900);
        else if (r < 0.46) play("dance", 1600);
        else if (r < 0.62) play("lean-left", 1600);
        else if (r < 0.8) speak(rnd(TIPS), 3000);
        else if (!mutedRef.current) {
          sfx.pop();
          burst(6);
        }
        loop();
      }, wait);
    };
    loop();
    return () => clearTimeout(t);
  }, [play, speak, burst, flying]);

  useEffect(() => {
    if (mood !== "idle" && !flying) {
      const t = setTimeout(() => setMood("idle"), 2400);
      return () => clearTimeout(t);
    }
  }, [mood, flying]);

  const onPointerDown = (e) => {
    cancelAnimationFrame(rafRef.current);
    setFlying(false);
    setReturning(false);
    if (floating) {
      if (!pos) return;
      drag.current = { mode: "float", sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    } else {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      natRef.current = { left: r.left - off.x, top: r.top - off.y, w: r.width, h: r.height };
      drag.current = { mode: "inline", sx: e.clientX, sy: e.clientY, ox: off.x, oy: off.y };
    }
    vel.current = { x: 0, y: 0, lx: e.clientX, ly: e.clientY, lt: performance.now() };
    moved.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const now = performance.now();
    const dt = now - vel.current.lt || 16;
    vel.current.x = (e.clientX - vel.current.lx) / dt;
    vel.current.y = (e.clientY - vel.current.ly) / dt;
    vel.current.lx = e.clientX;
    vel.current.ly = e.clientY;
    vel.current.lt = now;

    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    if (Math.abs(dx) + Math.abs(dy) > 6) moved.current = true;

    if (drag.current.mode === "float") {
      const maxX = window.innerWidth - size - 12;
      const maxY = window.innerHeight - size - 12;
      setPos({
        x: Math.max(8, Math.min(maxX, drag.current.ox + dx)),
        y: Math.max(8, Math.min(maxY, drag.current.oy + dy)),
      });
    } else {
      const nat = natRef.current;
      const minX = 8 - nat.left;
      const maxX = window.innerWidth - 8 - (nat.left + nat.w);
      const minY = 8 - nat.top;
      const maxY = window.innerHeight - 8 - (nat.top + nat.h);
      let nx = drag.current.ox + dx;
      let ny = drag.current.oy + dy;
      nx = maxX > minX ? Math.max(minX, Math.min(maxX, nx)) : 0;
      ny = maxY > minY ? Math.max(minY, Math.min(maxY, ny)) : 0;
      setOff({ x: nx, y: ny });
    }
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    const mode = drag.current.mode;
    drag.current = null;
    if (!moved.current) return;
    if (mode === "float") {
      const speed = Math.hypot(vel.current.x, vel.current.y);
      if (speed > SPEED) fling(vel.current.x, vel.current.y);
    } else {
      setReturning(true);
      setOff({ x: 0, y: 0 });
      sfx.boop();
      play("squish", 500);
    }
  };

  const handleClick = () => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    if (menu) {
      setMenu(false);
      return;
    }
    boop();
  };

  const handleDouble = (e) => {
    e.preventDefault();
    sfx.yay();
    setMood("love");
    play("spin", 900);
    speak("Yay! ✨", 2000);
    burst(22);
  };

  const bubble = say && (
    <div
      className={`fade-in pointer-events-none absolute z-20 max-w-[190px] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-[12.5px] leading-snug shadow-[var(--shadow)] ${
        floating ? "bottom-full right-0 mb-3" : "bottom-full left-1/2 mb-3 -translate-x-1/2"
      }`}
    >
      {say.text}
      <span
        className={`absolute h-2.5 w-2.5 rotate-45 border-b border-r border-[var(--border-strong)] bg-[var(--surface)] ${
          floating ? "-bottom-1.5 right-6" : "-bottom-1.5 left-1/2 -translate-x-1/2"
        }`}
      />
    </div>
  );

  const surprise = useCallback(() => {
    if (!onInsert) return;
    const text = rnd(SURPRISE);
    onInsert(text);
    sfx.pop();
    play("lean-right", 1200);
    speak("Try this one!", 2200);
    setMenu(false);
  }, [onInsert, play, speak]);

  const actions = [
    onNewChat && { icon: <SquarePen size={15} />, label: "New chat", run: onNewChat },
    onInsert && { icon: <Shuffle size={15} />, label: "Surprise me", run: surprise },
    onOpenStudio && { icon: <Wand2 size={15} />, label: "Prompt studio", run: onOpenStudio },
    { icon: <Lightbulb size={15} />, label: "Tell me a tip", run: tip },
    {
      icon: muted ? <VolumeX size={15} /> : <Volume2 size={15} />,
      label: muted ? "Sound off" : "Sound on",
      run: toggle,
    },
  ].filter(Boolean);

  const quick = (
    <div className="flex gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)]">
      <button className="icon-btn h-8 w-8" title="Boop me" onClick={boop}>
        <Sparkles size={15} />
      </button>
      <button className="icon-btn h-8 w-8" title="Dance" onClick={dance}>
        <Music2 size={15} />
      </button>
      <button className="icon-btn h-8 w-8" title="Confetti" onClick={spin}>
        <PartyPopper size={15} />
      </button>
      <button
        className={`icon-btn h-8 w-8 ${menu ? "bg-[var(--surface-2)] text-[var(--text)]" : ""}`}
        title="What can I do?"
        onClick={() => setMenu((m) => !m)}
      >
        <SlidersHorizontal size={15} />
      </button>
    </div>
  );

  const panel = (
    <div className="card w-44 overflow-hidden p-1.5 shadow-[var(--shadow)]">
      <div className="px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Ask Appui
      </div>
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => {
            a.run?.();
            setMenu(false);
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-[var(--text-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <span className="text-[var(--accent)]">{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  );

  const toolbar = (
    <div
      className={`absolute z-20 flex flex-col gap-2 transition-opacity duration-200 ${
        floating ? "bottom-full right-0 mb-2 items-end" : "top-full left-1/2 mt-3 -translate-x-1/2 items-center"
      } ${(hover || menu) && !flying ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      {floating && menu && panel}
      {quick}
      {!floating && menu && panel}
    </div>
  );

  const content = (
    <div
      ref={rootRef}
      className={`mascot-buddy relative touch-none cursor-grab active:cursor-grabbing ${
        returning ? "spring" : ""
      } ${className}`}
      style={{
        ...style,
        transform: `translate(${off.x}px, ${off.y}px)`,
        zIndex: off.x || off.y ? 40 : undefined,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={handleDouble}
    >
      {bursts.map((b) => (
        <span
          key={b.key}
          className="confetti-bit"
          style={{
            left: b.left,
            top: b.top,
            background: b.color,
            animationDelay: b.delay,
            "--dx": b.dx,
            "--dy": b.dy,
            "--rot": b.rot,
          }}
        />
      ))}
      {toolbar}
      {bubble}
      <Mascot
        size={size}
        mood={mood}
        look={look}
        className={`${anim} ${flying ? "flying" : ""}`}
        onClick={handleClick}
        sparkle
      />
    </div>
  );

  if (!floating) return content;

  return (
    <div
      className="fixed z-50 touch-none"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      {content}
    </div>
  );
}
