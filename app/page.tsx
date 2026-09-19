"use client";

import { useEffect, useMemo, useState } from "react";

type Action = { id: string; label: string; detail: string; icon: string };
type DocumentItem = { id: string; title: string; content: string; updatedAt: number };

const actions: Action[] = [
  { id: "concise", label: "Make it concise", detail: "Remove repetition", icon: "↘" },
  { id: "tone", label: "Improve tone", detail: "Clear & professional", icon: "✦" },
  { id: "examples", label: "Add examples", detail: "Make ideas concrete", icon: "+" },
  { id: "elaborate", label: "Elaborate section", detail: "Add useful depth", icon: "↗" },
  { id: "simplify", label: "Simplify text", detail: "Use plain language", icon: "≋" },
  { id: "summarize", label: "Summarize", detail: "Extract key points", icon: "—" },
];

const starter = `Artificial intelligence is rapidly transforming industries at an unprecedented scale. From healthcare diagnostics to creative workflows, AI systems are becoming embedded in the fabric of modern life.

As large language models grow in capability, the boundary between human and machine-authored content continues to blur—raising profound questions about authenticity and attribution.

The key challenge for practitioners is not merely adopting AI tools, but embedding them thoughtfully into existing ethics frameworks and governance structures.`;

const initialDocs: DocumentItem[] = [
  { id: "future-ai", title: "The Future of AI", content: starter, updatedAt: Date.now() },
  { id: "alpha", title: "Project Alpha Proposal", content: "Project Alpha is a focused plan for turning a strong idea into a useful, measurable product.", updatedAt: Date.now() - 7200000 },
  { id: "trends", title: "Technology Trends", content: "The most important technology trends are the ones that quietly improve how people work, learn, and communicate.", updatedAt: Date.now() - 86400000 },
];

function timeLabel(time: number) {
  const mins = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (mins < 1) return "Active now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export default function Home() {
  const [docs, setDocs] = useState<DocumentItem[]>(initialDocs);
  const [activeId, setActiveId] = useState(initialDocs[0].id);
  const [content, setContent] = useState(starter);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("syntax-ai-documents");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DocumentItem[];
        if (parsed.length) {
          setDocs(parsed);
          setActiveId(parsed[0].id);
          setContent(parsed[0].content);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDocs((current) => {
        const next = current.map((doc) =>
          doc.id === activeId
            ? { ...doc, content, title: content.trim().split(/[.!?\n]/)[0]?.slice(0, 42) || "Untitled document", updatedAt: Date.now() }
            : doc,
        );
        localStorage.setItem("syntax-ai-documents", JSON.stringify(next));
        return next;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [content, activeId]);

  const stats = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    return { words, chars: content.length, read: Math.max(1, Math.ceil(words / 220)) };
  }, [content]);

  function openDoc(doc: DocumentItem) {
    setActiveId(doc.id);
    setContent(doc.content);
    setResult("");
    setError("");
    setHistoryOpen(false);
  }

  function newDocument() {
    const doc = { id: crypto.randomUUID(), title: "Untitled document", content: "", updatedAt: Date.now() };
    setDocs((current) => [doc, ...current]);
    setActiveId(doc.id);
    setContent("");
    setResult("");
  }

  async function runAction(action: Action) {
    if (!content.trim() || loading) return;
    setLoading(action.id);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, action: action.id }),
      });
      const data = (await response.json()) as { output?: string; error?: string };
      if (!response.ok || !data.output) throw new Error(data.error || "Request failed.");
      setResult(data.output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading("");
    }
  }

  async function copyResult() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <button className="brand" aria-label="Syntax AI home"><span>S</span><i /></button>
        <div className="system"><b>SYS.ACT</b><span>PORT_5174</span></div>
        <div className="top-status"><span className="status-dot" /> AI writing workspace <kbd>⌘ K</kbd></div>
        <button className="history-trigger" onClick={() => setHistoryOpen(!historyOpen)}>Documents</button>
      </header>

      <section className="workspace">
        <aside className={`history ${historyOpen ? "open" : ""}`}>
          <div className="panel-heading"><div><span>Document history</span><small>{docs.length} local files</small></div><button onClick={newDocument} aria-label="New document">+</button></div>
          <div className="documents">
            {docs.map((doc, index) => (
              <button key={doc.id} className={`doc ${doc.id === activeId ? "active" : ""}`} onClick={() => openDoc(doc)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{doc.title}</b><small>{timeLabel(doc.updatedAt)}</small></div>
              </button>
            ))}
          </div>
          <div className="storage"><span /><p><b>Local-first storage</b><small>Your drafts stay in this browser.</small></p></div>
        </aside>

        <section className="editor-panel">
          <div className="editor-head">
            <div><span className="eyebrow">CURRENT DOCUMENT</span><h1>{docs.find((doc) => doc.id === activeId)?.title || "Untitled document"}</h1></div>
            <div className="stats"><span>{stats.words} words</span><span>{stats.read} min read</span><span>{stats.chars} chars</span></div>
          </div>
          <textarea
            aria-label="Document editor"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Begin writing, then choose an AI action…"
            spellCheck
          />
          <footer className="editor-footer"><span><i /> Auto-saved</span><span>PLAIN TEXT · UTF-8</span></footer>
        </section>

        <aside className="assistant-panel">
          <div className="assistant-head"><div><span className="pulse-ring"><i /></span><div><b>Syntax engine</b><small>{loading ? "Processing request…" : "Ready for instruction"}</small></div></div><span className="online">ONLINE</span></div>
          <div className="actions">
            {actions.map((action) => (
              <button key={action.id} onClick={() => runAction(action)} disabled={!content.trim() || Boolean(loading)}>
                <span className="action-icon">{loading === action.id ? "◌" : action.icon}</span>
                <span><b>{action.label}</b><small>{action.detail}</small></span>
                <em>↗</em>
              </button>
            ))}
          </div>

          <div className={`output ${result || error || loading ? "visible" : ""}`}>
            <div className="output-head"><span>{error ? "SYSTEM NOTICE" : "AI OUTPUT"}</span>{result && <button onClick={copyResult}>{copied ? "Copied" : "Copy"}</button>}</div>
            {loading && <div className="thinking"><span /><span /><span /> Refining your text</div>}
            {error && <p className="error">{error}</p>}
            {result && <><p>{result}</p><button className="apply" onClick={() => { setContent(result); setResult(""); }}>Apply to document <span>↗</span></button></>}
          </div>

          <div className="model-info"><span>MODEL <b>{process.env.NEXT_PUBLIC_MODEL_LABEL || "OPENAI"}</b></span><span>PROCESSING <b>SECURE</b></span></div>
        </aside>
      </section>
    </main>
  );
}
