import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

function CodeBlock({ children }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);

  const lang =
    children?.props?.className?.match(/language-([\w-]+)/)?.[1] || "code";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ref.current?.innerText || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--code-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-1.5">
        <span className="mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
          {lang}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre ref={ref} className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

export default function Markdown({ children }) {
  return (
    <div className="md text-[15px] leading-[1.75] text-[var(--text)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          code: ({ className, children, ...props }) => (
            <code
              className={`mono rounded bg-[var(--surface-3)] px-[5px] py-[2px] text-[0.86em] ${
                className || ""
              }`}
              {...props}
            >
              {children}
            </code>
          ),
          a: ({ children, ...props }) => (
            <a
              className="text-[var(--accent)] underline underline-offset-2 hover:opacity-80"
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          ul: (props) => <ul className="my-2 list-disc space-y-1 pl-6" {...props} />,
          ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-6" {...props} />,
          h1: (props) => <h1 className="mb-2 mt-4 text-xl font-bold" {...props} />,
          h2: (props) => <h2 className="mb-2 mt-4 text-lg font-bold" {...props} />,
          h3: (props) => <h3 className="mb-1.5 mt-3 text-base font-semibold" {...props} />,
          p: (props) => <p className="my-2 whitespace-pre-wrap" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="my-3 border-l-2 border-[var(--accent)] pl-4 italic text-[var(--text-soft)]"
              {...props}
            />
          ),
          table: (props) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-left font-semibold"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border border-[var(--border)] px-3 py-1.5" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
