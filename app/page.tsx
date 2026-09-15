"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
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

/* ── FEED CARD ──────────────────────────────────────────────
   Thin, airy history row for non-technical users:
   icon + generated file name + "Open Code" shortcut.
───────────────────────────────────────────────────────────── */
function FeedCard({
  fileName,
  isStreaming,
  onOpenCode,
}: {
  fileName: string;
  isStreaming: boolean;
  onOpenCode: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
      {/* File icon */}
      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-3.5 h-3.5 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>

      {/* File name */}
      <span className="flex-1 min-w-0 truncate text-[12.5px] text-gray-700 font-medium">
        {fileName}
      </span>

      {isStreaming && (
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
      )}

      {/* Open Code shortcut */}
      <button
        onClick={onOpenCode}
        disabled={isStreaming}
        className="flex-shrink-0 px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-500 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Open Code
      </button>
    </div>
  );
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
  const [finalCode, setFinalCode] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("split");
  const [projectName, setProjectName] = useState("my-app");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll feed container when new cards appear
  useEffect(() => {
    if (feedRef.current && isStreaming) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
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

      setIsStreaming(true);
      setIsDone(false);
      setError("");
      setFinalCode("");

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
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
        }

        const clean = accumulated
          .replace(/^```[\w]*\n?/m, "")
          .replace(/\n?```\s*$/m, "")
          .trim();

        setFinalCode(clean);
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
    setFinalCode("");
    setError("");
  };

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
          <div className="flex-1 min-h-0 overflow-y-auto p-3">
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
              <div ref={feedRef} className="space-y-2">
                <FeedCard
                  fileName="App.js"
                  isStreaming={isStreaming}
                  onOpenCode={() => setView("code")}
                />
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

            {/* Sandpack preview when done */}
            {isDone && finalCode && !isStreaming && (
              <SandpackProvider
                key={finalCode}
                template="react"
                files={{ "/App.js": finalCode }}
                theme="light"
                options={{ externalResources: ["https://cdn.tailwindcss.com"] }}
              >
                {view === "code" ? (
                  <SandpackCodeEditor
                    style={{ height: "100vh", width: "100%" }}
                    showLineNumbers
                    showTabs={false}
                    readOnly
                  />
                ) : (
                  <SandpackPreview
                    style={{ height: "100vh", width: "100%" }}
                    showNavigator={false}
                    showOpenInCodeSandbox={false}
                  />
                )}
              </SandpackProvider>
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
