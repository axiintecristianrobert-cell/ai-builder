"use client";

import { useState } from "react";
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from "@codesandbox/sandpack-react";

const DEFAULT_CODE = `export default function App() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", background: "#0f0f0f", color: "#fff" }}>
      <h1>Generează o aplicație ✨</h1>
    </div>
  );
}`;

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Eroare la generare");

      const data = await res.json();
      if (data.code) setCode(data.code);
    } catch (err) {
      setError("A apărut o eroare. Verifică cheia API și încearcă din nou.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Left panel */}
      <div className="flex flex-col w-[40%] min-w-[320px] border-r border-zinc-800 p-6 gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-sm font-semibold tracking-widest uppercase text-zinc-400">
            AI App Builder
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white leading-tight">
          Descrie aplicația ta
        </h1>
        <p className="text-sm text-zinc-500">
          Scrie ce vrei să construiești și Claude va genera codul React instant.
        </p>

        <textarea
          className="flex-1 w-full rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-600 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          placeholder="Ex: O aplicație todo list cu posibilitatea de a adăuga, bifa și șterge sarcini. Folosește un design modern cu gradient violet."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
          }}
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Se generează...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generează
              <span className="ml-auto text-xs text-zinc-400 font-normal">⌘↵</span>
            </>
          )}
        </button>

        <p className="text-xs text-zinc-600 text-center">
          Powered by Claude claude-sonnet-4-6
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <span className="text-xs text-zinc-500 font-mono">App.js — Preview live</span>
        </div>

        <div className="flex-1 min-h-0">
          <SandpackProvider
            key={code}
            template="react"
            files={{ "/App.js": code }}
            theme="dark"
            options={{ externalResources: ["https://cdn.tailwindcss.com"] }}
          >
            <SandpackLayout style={{ height: "100%", border: "none", borderRadius: 0 }}>
              <SandpackPreview style={{ flex: 1, height: "100%" }} showNavigator={false} />
              <SandpackCodeEditor
                style={{ flex: 1, height: "100%", maxWidth: "50%" }}
                showLineNumbers
                readOnly
              />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
}
