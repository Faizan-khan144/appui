import { useState } from "react";
import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import Markdown from "./Markdown";
import Mascot from "./Mascot";

function fmt(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function Message({ msg, streaming, onRegenerate, showRegenerate, onEdit }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  if (isUser) {
    return (
      <div className="group flex justify-end px-1 py-3 fade-in">
        <div className="flex max-w-[82%] flex-col items-end">
          <div className="rounded-2xl rounded-br-md border border-[var(--border)] bg-[var(--surface-3)] px-4 py-2.5 text-[15px] leading-[1.7] whitespace-pre-wrap">
            {msg.content}
          </div>
          <div className="-mr-1 mt-1 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
            {msg.ts ? (
              <span className="mr-1 text-[11px] text-[var(--muted)]">{fmt(msg.ts)}</span>
            ) : null}
            <button onClick={copy} className="icon-btn h-7 w-7" title="Copy">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            {onEdit && (
              <button onClick={() => onEdit(msg)} className="icon-btn h-7 w-7" title="Edit & resend">
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex gap-3 px-1 py-3 fade-in">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] ring-1 ring-[var(--border)]">
        <Mascot size={22} sparkle={false} mood={streaming ? "thinking" : "happy"} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[13px] font-semibold">Appui</span>
          {msg.ts ? (
            <span className="text-[11px] text-[var(--muted)]">{fmt(msg.ts)}</span>
          ) : null}
        </div>

        {msg.error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-red-300">
            {msg.content}
          </div>
        ) : msg.content ? (
          <Markdown>{msg.content}</Markdown>
        ) : streaming ? (
          <div className="flex items-center gap-1.5 py-2">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        ) : null}

        {!streaming && msg.content && !msg.error && (
          <div className="-ml-1 mt-1.5 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
            <button onClick={copy} className="icon-btn h-7 w-7" title="Copy">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            {showRegenerate && (
              <button onClick={onRegenerate} className="icon-btn h-7 w-7" title="Regenerate">
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
