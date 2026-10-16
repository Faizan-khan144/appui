import { useEffect, useState } from "react";

const KEY = "appui.sound";

let ctx = null;
let muted =
  typeof localStorage !== "undefined" ? localStorage.getItem(KEY) === "off" : false;
const listeners = new Set();

function ac() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone({ freq, freqEnd, type = "sine", dur = 0.14, when = 0, gain = 0.13 }) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.014);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.04);
}

export const sfx = {
  boop() {
    tone({ freq: 700, freqEnd: 320, type: "sine", dur: 0.17, gain: 0.17 });
  },
  pop() {
    tone({ freq: 300, freqEnd: 780, type: "triangle", dur: 0.1, gain: 0.12 });
  },
  happy() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone({ freq: f, type: "sine", dur: 0.16, when: i * 0.07, gain: 0.11 })
    );
  },
  sparkle() {
    [1318, 1760, 2093, 1568].forEach((f, i) =>
      tone({ freq: f, type: "triangle", dur: 0.09, when: i * 0.045, gain: 0.05 })
    );
  },
  think() {
    tone({ freq: 430, type: "sine", dur: 0.11, gain: 0.08 });
    tone({ freq: 590, type: "sine", dur: 0.11, when: 0.13, gain: 0.08 });
  },
  whoops() {
    tone({ freq: 420, freqEnd: 130, type: "sine", dur: 0.32, gain: 0.15 });
  },
  giggle() {
    [880, 990, 880, 1100].forEach((f, i) =>
      tone({ freq: f, type: "sine", dur: 0.07, when: i * 0.09, gain: 0.09 })
    );
  },
  yay() {
    sfx.happy();
    sfx.sparkle();
  },
};

export function setMuted(v) {
  muted = v;
  if (typeof localStorage !== "undefined") localStorage.setItem(KEY, v ? "off" : "on");
  listeners.forEach((fn) => fn(v));
}

export function isMuted() {
  return muted;
}

export function useSound() {
  const [m, setM] = useState(muted);
  useEffect(() => {
    listeners.add(setM);
    return () => listeners.delete(setM);
  }, []);
  const toggle = () => setMuted(!muted);
  return { muted: m, toggle };
}
