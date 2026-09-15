"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";

type View = "split" | "code" | "preview";

const EXAMPLE_PROMPTS = [
  {
    label: "Todo app",
    description: "Add, complete, and delete tasks",
    icon: "✓",
    color: "bg-violet-50 text-violet-600",
    prompt:
      "Create a beautiful todo app with add, complete, and delete functionality. Use a clean modern design with smooth animations and a minimalist layout. Include a counter for remaining tasks.",
  },
  {
    label: "Calculator",
    description: "Modern iOS-style calculator",
    icon: "#",
    color: "bg-blue-50 text-blue-600",
    prompt:
      "Build a calculator app with basic operations (+, -, *, /). Make it look like a modern iOS calculator with dark background, rounded buttons, and smooth interactions.",
  },
  {
    label: "Landing page",
    description: "SaaS presentation page",
    icon: "↗",
    color: "bg-emerald-50 text-emerald-600",
    prompt:
      "Create a stunning SaaS landing page with a hero section featuring a gradient headline, features grid with icons, pricing cards (3 tiers), and a CTA section. Use a modern purple and white color scheme.",
  },
  {
    label: "Weather app",
    description: "5-day forecast UI",
    icon: "◎",
    color: "bg-amber-50 text-amber-600",
    prompt:
      "Build a beautiful weather app UI with current weather display, a 5-day forecast row, and animated weather icons using emojis. Use glassmorphism cards on a gradient background.",
  },
  {
    label: "Dashboard",
    description: "Metrics and charts panel",
    icon: "▦",
    color: "bg-rose-50 text-rose-600",
    prompt:
      "Create an analytics dashboard with KPI cards (revenue, users, conversion rate), a bar chart made with CSS, a recent activity feed, and a top products table.",
  },
  {
    label: "Kanban board",
    description: "Columns with task cards",
    icon: "≡",
    color: "bg-cyan-50 text-cyan-600",
    prompt:
      "Build a Kanban board with three columns: Todo, In Progress, Done. Each column has task cards with title, tag badge, and priority indicator. White cards on light gray background.",
  },
];

/* ── FILE ICONS ─────────────────────────────────────────────
   One icon per kind of file, so a row reads before it is read.
───────────────────────────────────────────────────────────── */
type FileKind = { tone: string; path: React.ReactNode };

const KIND_COMPONENT: FileKind = {
  tone: "bg-violet-50 text-violet-600",
  path: (
    <path d="M14 4.5h4.4c.6 0 1.1.5 1.1 1.1V10m0 0a2.2 2.2 0 100 4.4V19c0 .6-.5 1-1.1 1H14m0 0a2.2 2.2 0 10-4.4 0H5.1c-.6 0-1.1-.4-1.1-1v-4.4m0 0a2.2 2.2 0 100-4.4V5.6c0-.6.5-1.1 1.1-1.1h4.5m0 0a2.2 2.2 0 104.4 0" />
  ),
};

const KIND_DATA: FileKind = {
  tone: "bg-teal-50 text-teal-600",
  path: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
    </>
  ),
};

const KIND_STYLE: FileKind = {
  tone: "bg-pink-50 text-pink-600",
  path: (
    <>
      <path d="M12 3a9 9 0 000 18c1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8h2.1A4.3 4.3 0 0021 10.7C21 6.4 16.9 3 12 3z" />
      <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
};

const KIND_CONFIG: FileKind = {
  tone: "bg-amber-50 text-amber-600",
  path: (
    <path d="M8.5 4.5h-1A2.5 2.5 0 005 7v2.2c0 1-.8 1.8-1.8 1.8h-.4v2h.4c1 0 1.8.8 1.8 1.8V17a2.5 2.5 0 002.5 2.5h1M15.5 4.5h1A2.5 2.5 0 0119 7v2.2c0 1 .8 1.8 1.8 1.8h.4v2h-.4c-1 0-1.8.8-1.8 1.8V17a2.5 2.5 0 01-2.5 2.5h-1" />
  ),
};

const KIND_CODE: FileKind = {
  tone: "bg-gray-100 text-gray-500",
  path: <path d="M9.5 8.5L6 12l3.5 3.5M14.5 8.5L18 12l-3.5 3.5" />,
};

function kindFor(path: string): FileKind {
  const name = path.slice(path.lastIndexOf("/") + 1);
  if (/\.(css|scss)$/.test(name)) return KIND_STYLE;
  if (/\.json$/.test(name) || /\.config\.[jt]s$/.test(name)) return KIND_CONFIG;
  if (/^\/(lib|data|api|utils)\//.test(path)) return KIND_DATA;
  if (/^[A-Z]/.test(name)) return KIND_COMPONENT;
  return KIND_CODE;
}

function FileIcon({ path }: { path: string }) {
  const kind = kindFor(path);
  return (
    <span className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center flex-shrink-0 ${kind.tone}`}>
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind.path}
      </svg>
    </span>
  );
}

/* ── FEED ENTRY ─────────────────────────────────────────────
   What the agent did, then the file it did it in.
───────────────────────────────────────────────────────────── */
type StreamEvent =
  | { type: "file_start"; path: string; description: string }
  | { type: "file"; path: string; description: string; code: string; lines: number }
  | { type: "summary"; text: string }
  | { type: "error"; message: string };

type FeedFile = {
  path: string;
  description: string;
  code: string;
  lines: number;
  done: boolean;
};

function FeedEntry({
  file,
  isActive,
  onOpenCode,
}: {
  file: FeedFile;
  isActive: boolean;
  onOpenCode: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {file.description && (
        <p className="px-0.5 text-[12.5px] leading-relaxed text-gray-500">
          {file.description}
        </p>
      )}

      <div
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border bg-white transition-all ${
          isActive
            ? "border-indigo-200 ring-[3px] ring-indigo-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <FileIcon path={file.path} />

        <span className="flex-1 min-w-0 truncate font-mono text-[11.5px] text-gray-700">
          {file.path}
        </span>

        {file.done ? (
          <span className="flex-shrink-0 text-[10.5px] text-gray-400 tabular-nums">
            {file.lines} linii
          </span>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
        )}

        <button
          onClick={onOpenCode}
          disabled={!file.done}
          className="flex-shrink-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[10.5px] font-medium text-gray-500 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Open Code
        </button>
      </div>
    </div>
  );
}

/* ── FEED HEADER & CLOSING MESSAGE ──────────────────────── */
function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return min ? `${min}m ${sec}s` : `${sec}s`;
}

function FeedHeader({
  count,
  isStreaming,
  durationMs,
}: {
  count: number;
  isStreaming: boolean;
  durationMs: number;
}) {
  return (
    <div className="flex items-center gap-2 px-0.5 pb-3 border-b border-gray-100">
      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
      <span className="text-[12.5px] font-semibold text-gray-800">
        {isStreaming ? "Scriu codul" : "Am scris codul"}
      </span>
      <span className="ml-auto flex items-center gap-2.5 text-[10.5px] text-gray-400 tabular-nums">
        <span>
          {count} {count === 1 ? "fișier actualizat" : "fișiere actualizate"}
        </span>
        <span>{formatDuration(durationMs)}</span>
      </span>
    </div>
  );
}

function FeedDone({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-3 rounded-xl bg-emerald-50">
      <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25 4.5-4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-emerald-800">Aplicația ta e gata</p>
        <p className="text-[11.5px] text-emerald-700/80 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

/* ── ACTIVE FILE ────────────────────────────────────────────
   Points the Sandpack editor at the file "Open Code" asked for,
   without remounting the sandbox.
───────────────────────────────────────────────────────────── */
function ActiveFile({ path }: { path: string | null }) {
  const { sandpack } = useSandpack();
  const sandpackRef = useRef(sandpack);

  useEffect(() => {
    sandpackRef.current = sandpack;
  });

  useEffect(() => {
    if (path) sandpackRef.current.setActiveFile(path);
  }, [path]);

  return null;
}

/* ── CHAT INPUT ─────────────────────────────────────────── */
function ChatInput({
  prompt,
  setPrompt,
  isStreaming,
  error,
  onGenerate,
  onKeyDown,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  isStreaming: boolean;
  error: string;
  onGenerate: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-white">
      <div
        className={`border rounded-xl overflow-hidden transition-all ${
          error
            ? "border-red-200"
            : "border-gray-200 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100"
        }`}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message Agent..."
          rows={2}
          disabled={isStreaming}
          className="w-full text-[13px] text-gray-800 placeholder-gray-400 px-3.5 pt-3 pb-1 resize-none focus:outline-none leading-relaxed bg-transparent disabled:opacity-40"
        />
        <div className="flex items-center gap-2 px-3 pb-2.5 pt-1">
          <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 font-medium transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Save
          </button>
          <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 font-medium transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Fork
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[10px] text-gray-300 font-mono">⌘↵</span>
            <button
              onClick={onGenerate}
              disabled={isStreaming || !prompt.trim()}
              className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {isStreaming ? (
                <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-start gap-1.5">
          <svg className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-[11px] text-red-500 leading-relaxed">{error}</p>
        </div>
      )}

      <div className="mt-2.5 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] text-gray-400">claude-sonnet-4-6</span>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────────── */
export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<FeedFile[]>([]);
  const [summary, setSummary] = useState("");
  const [buildId, setBuildId] = useState(0);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("split");
  const [projectName, setProjectName] = useState("my-app");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef(0);

  // Scroll the feed as new files land
  useEffect(() => {
    if (feedRef.current && isStreaming) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [files, isStreaming]);

  // Tick the build clock while the agent works
  useEffect(() => {
    if (!isStreaming) return;
    const id = setInterval(() => setDurationMs(Date.now() - startedAtRef.current), 1000);
    return () => clearInterval(id);
  }, [isStreaming]);

  // Handle divider drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      if (newWidth > 30 && newWidth < 70) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const generate = useCallback(
    async (promptText: string) => {
      if (!promptText.trim() || isStreaming) return;

      startedAtRef.current = Date.now();
      setIsStreaming(true);
      setIsDone(false);
      setError("");
      setFiles([]);
      setSummary("");
      setActivePath(null);
      setDurationMs(0);

      const slug = promptText
        .trim()
        .split(" ")
        .slice(0, 3)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 28);
      setProjectName(slug || "my-app");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptText }),
        });

        if (!res.ok) {
          const ct = res.headers.get("Content-Type") ?? "";
          if (ct.includes("json")) {
            const data = await res.json();
            throw new Error(data.error || "Generation failed");
          }
          throw new Error("Generation failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let failure = "";

        const handleEvent = (event: StreamEvent) => {
          if (event.type === "file_start") {
            setFiles(prev => [
              ...prev,
              {
                path: event.path,
                description: event.description,
                code: "",
                lines: 0,
                done: false,
              },
            ]);
            return;
          }
          if (event.type === "file") {
            setFiles(prev => {
              const next = [...prev];
              const at = next.findIndex(f => f.path === event.path && !f.done);
              const entry: FeedFile = {
                path: event.path,
                description: event.description || next[at]?.description || "",
                code: event.code,
                lines: event.lines,
                done: true,
              };
              if (at === -1) next.push(entry);
              else next[at] = entry;
              return next;
            });
            return;
          }
          if (event.type === "summary") {
            setSummary(event.text);
            return;
          }
          if (event.type === "error") failure = event.message;
        };

        const drain = (chunk: string) => {
          buffer += chunk;
          let nl = buffer.indexOf("\n");
          while (nl !== -1) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (line) {
              try {
                handleEvent(JSON.parse(line) as StreamEvent);
              } catch {
                // a partial line can never be valid JSON — skip it
              }
            }
            nl = buffer.indexOf("\n");
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          drain(decoder.decode(value, { stream: true }));
        }
        drain("\n");

        if (failure) throw new Error(failure);

        setDurationMs(Date.now() - startedAtRef.current);
        setBuildId(id => id + 1);
        setIsDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming]
  );

  const handleExampleClick = (p: string) => {
    setPrompt(p);
    generate(p);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate(prompt);
  };

  const resetProject = () => {
    setIsDone(false);
    setFiles([]);
    setSummary("");
    setActivePath(null);
    setError("");
  };

  const openCode = (path: string) => {
    setActivePath(path);
    setView("code");
  };

  const sandpackFiles = Object.fromEntries(
    files.filter(f => f.done && f.code).map(f => [f.path, f.code])
  );
  const canPreview = isDone && Boolean(sandpackFiles["/App.js"]);

  const hasActivity = isStreaming || isDone;

  return (
    <div className="flex flex-col h-screen bg-white antialiased overflow-hidden">

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="h-11 flex-shrink-0 border-b border-gray-100 bg-white flex items-center px-3 gap-1 z-10">
        <div className="flex items-center pr-3">
          <img src="/logo.png" alt="Setherion" className="h-14 w-auto object-contain" />
        </div>

        <div className="w-px h-4 bg-gray-200" />

        <button className="px-2.5 py-1 rounded-md text-[12px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors ml-1">
          Home
        </button>

        {hasActivity && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[12px] text-gray-700 shadow-sm ml-0.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="max-w-[140px] truncate">{projectName}</span>
            <button
              onClick={resetProject}
              className="text-gray-300 hover:text-gray-500 ml-0.5 leading-none text-[14px] transition-colors"
            >
              ×
            </button>
          </div>
        )}

        <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg leading-none ml-0.5">
          +
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView(v => v === "code" ? "split" : "code")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${view === "code" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              Code
            </button>
            <button
              onClick={() => setView(v => v === "preview" ? "split" : "preview")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${view === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preview
            </button>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-sm shadow-indigo-200">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Deploy
          </button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 flex min-h-0">

        {/* ── CHAT SIDEBAR (DRAGGABLE LEFT) ──────────────── */}
        <div
          className="flex flex-col border-r border-gray-100 bg-white overflow-hidden"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div ref={feedRef} className="flex-1 min-h-0 overflow-y-auto p-3">
            {!hasActivity ? (
              <div className="h-full flex flex-col items-center justify-center gap-2.5 select-none">
                <svg className="w-9 h-9 text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                <p className="text-[12px] text-gray-300 text-center">
                  Selectează un prompt<br />sau scrie ceva nou
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                  {EXAMPLE_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setPrompt(p.prompt);
                        generate(p.prompt);
                      }}
                      className={`p-2 rounded-lg text-left text-[11px] font-medium transition-colors ${p.color}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                <FeedHeader
                  count={files.filter(f => f.done).length}
                  isStreaming={isStreaming}
                  durationMs={durationMs}
                />

                {files.map((file, i) => (
                  <FeedEntry
                    key={`${file.path}-${i}`}
                    file={file}
                    isActive={activePath === file.path}
                    onOpenCode={() => openCode(file.path)}
                  />
                ))}

                {isDone && files.length > 0 && (
                  <FeedDone
                    message={
                      summary ||
                      "Am terminat de scris codul — o vezi în dreapta. Scrie-mi dacă vrei să schimbăm ceva."
                    }
                  />
                )}
              </div>
            )}
          </div>

          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            isStreaming={isStreaming}
            error={error}
            onGenerate={() => generate(prompt)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* ── DIVIDER (DRAGGABLE) ───────────────────────── */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="w-1 bg-gray-100 hover:bg-indigo-400 cursor-col-resize transition-colors flex-shrink-0"
        />

        {/* ── PREVIEW PANEL (RIGHT) ──────────────────────── */}
        <div
          className="relative bg-white overflow-auto flex-1 min-h-0"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >

            {/* Loading while streaming */}
            {isStreaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 bg-white">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <div className="absolute inset-3 rounded-full border border-gray-100" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-medium text-gray-900">Claude scrie codul</p>
                  <p className="text-[12px] text-gray-400 mt-1">Preview apare când termină</p>
                </div>
                {/* Animated skeleton lines */}
                <div className="flex flex-col gap-2 w-52 opacity-20 mt-2">
                  {[100, 72, 88, 55, 80, 65].map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 bg-gray-300 rounded-full animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* The generated project: preview, or the file "Open Code" asked for */}
            {canPreview && !isStreaming && (
              <SandpackProvider
                key={buildId}
                template="react"
                files={sandpackFiles}
                theme="light"
                options={{
                  externalResources: ["https://cdn.tailwindcss.com"],
                  visibleFiles: Object.keys(sandpackFiles),
                  activeFile: activePath ?? "/App.js",
                }}
              >
                <ActiveFile path={activePath} />
                <div style={{ display: view === "code" ? "block" : "none" }}>
                  <SandpackCodeEditor
                    style={{ height: "100vh", width: "100%" }}
                    showLineNumbers
                    showTabs
                    readOnly
                  />
                </div>
                <div style={{ display: view === "code" ? "none" : "block" }}>
                  <SandpackPreview
                    style={{ height: "100vh", width: "100%" }}
                    showNavigator={false}
                    showOpenInCodeSandbox={false}
                  />
                </div>
              </SandpackProvider>
            )}

            {/* The model wrote files but no root component — say so instead of a blank panel */}
            {isDone && !canPreview && !isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center px-8">
                <p className="text-[13px] text-gray-400 text-center max-w-xs leading-relaxed">
                  Nu pot porni preview-ul: lipsește fișierul principal /App.js.
                  Cere-mi să încerc din nou.
                </p>
              </div>
            )}

            {/* Welcome screen */}
            {!isStreaming && !isDone && (
              <div className="absolute inset-0 flex items-center justify-center overflow-auto">
                <div className="w-full max-w-xl px-8 py-10 text-center">
                  <div className="mb-6">
                    <img src="/logo.png" alt="Setherion" className="h-14 w-auto object-contain mx-auto drop-shadow-lg" />
                  </div>
                  <h1 className="text-[26px] font-semibold text-gray-900 tracking-tight mb-2">
                    Ce construim azi?
                  </h1>
                  <p className="text-[14px] text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
                    Scrie în chat sau alege un exemplu.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 text-left">
                    {EXAMPLE_PROMPTS.map((ex) => (
                      <button
                        key={ex.label}
                        onClick={() => handleExampleClick(ex.prompt)}
                        className="group flex items-start gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className={`w-7 h-7 rounded-lg ${ex.color} flex items-center justify-center flex-shrink-0 text-[12px] font-bold`}>
                          {ex.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-gray-900 mb-0.5">{ex.label}</p>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{ex.description}</p>
                        </div>
                        <svg className="w-3 h-3 text-gray-200 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
