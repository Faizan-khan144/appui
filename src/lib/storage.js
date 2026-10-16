const KEY = "appui.chats.v1";
const SETTINGS = "appui.settings.v1";

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function loadChats() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChats(chats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(chats));
  } catch {
    /* quota */
  }
}

export function newChat(model) {
  const now = Date.now();
  return {
    id: uid(),
    title: "New chat",
    model,
    mode: "chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSettings(s) {
  try {
    localStorage.setItem(SETTINGS, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

export function groupByDate(chats) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 86400000;
  const groups = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];
  [...chats]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((c) => {
      if (c.updatedAt >= startOfToday) groups[0].items.push(c);
      else if (c.updatedAt >= startOfToday - day) groups[1].items.push(c);
      else if (c.updatedAt >= startOfToday - 7 * day) groups[2].items.push(c);
      else groups[3].items.push(c);
    });
  return groups.filter((g) => g.items.length);
}
