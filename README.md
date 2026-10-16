<div align="center">

<img src="public/appui.svg" alt="Appui" width="88" height="88" />

# Appui

**A lightweight AI chat assistant with a built-in image-prompt studio — and a mascot you can actually play with.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

Live answers with **no API key required** — just open it and go.

</div>

---

## ✨ Features

- **Streaming chat** — replies arrive token-by-token, rendered as Markdown with GFM tables and syntax-highlighted code.
- **Image-prompt studio** — turn a one-line idea into a polished prompt tuned for Midjourney, DALL·E, Stable Diffusion or Flux.
- **Free, keyless backend** — a hosted proxy streams answers out of the box. No sign-up, no key, nothing to configure.
- **Optional Groq** — drop in a `GROQ_API_KEY` and Appui switches to Groq automatically, with graceful fallback if it ever fails.
- **Personas & models** — pick a tone and a model right from the composer.
- **Private by default** — your chats live in the browser's local storage. Nothing is stored on a server.
- **Interactive mascot** — boop it, double-click for confetti, watch its eyes follow you, or pick it up and throw it (it bounces back).
- **Keyboard-first** — `Ctrl / Cmd + K` for a new chat, `Enter` to send, `Shift + Enter` for a new line.
- **Export & copy** — copy any message, the whole chat, or export it as Markdown.
- **Themes** — light and dark, plus four accent colors.

## 🧱 Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + React Router 6 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| Icons | lucide-react |
| Backend | Vite dev middleware / Node server proxy |

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Live answers work immediately — no key needed.

### Production build

```bash
npm run build
npm start
```

`npm start` runs a small Node server that serves the built app and the API together.

## ⚙️ Configuration

Everything works with zero configuration. To use your own Groq key instead of the free backend, create `.env.local` in the project root:

```env
GROQ_API_KEY=your_key_here
```

- The key is read **server-side only** — it never reaches the browser.
- If the key is missing or invalid, Appui falls back to the free keyless backend automatically.

## 📜 Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 5173 |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Preview the production build |
| `npm start` | Run the standalone Node server (API + `dist/`) |

## 📁 Project structure

```
appui/
├─ server/
│  ├─ ai.js            # Chat/model handler: free keyless backend + optional Groq
│  └─ index.js         # Standalone production server (API + static dist)
├─ src/
│  ├─ components/      # Composer, Message, Sidebar, Mascot, MascotBuddy, Markdown…
│  ├─ lib/             # api, prompt, models, storage, theme, sound, demo
│  ├─ pages/           # Landing, Chat, Studio
│  ├─ App.jsx          # Routes
│  ├─ main.jsx         # Entry
│  └─ index.css        # Tailwind + design tokens
├─ public/             # Static assets (logo)
├─ vite.config.js      # Vite config + API middleware
└─ index.html
```

## 🔌 How the free backend works

The chat endpoint (`/api/ai/chat`) is handled by the Vite dev middleware (and by `server/index.js` in production). It proxies to a free, keyless OpenAI-compatible backend and streams the response straight back with server-sent events.

If a `GROQ_API_KEY` is present, requests go to Groq instead. If Groq returns `401`/`403`, the backend demotes itself to the free provider and keeps working.

## 📄 License

[MIT](LICENSE) © 2026 Faizan
