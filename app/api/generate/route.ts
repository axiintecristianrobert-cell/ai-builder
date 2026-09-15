import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a React developer building a complete, working app for a non-technical user.

Answer ONLY in the marker format below. No markdown, no code fences, no backticks, no commentary outside the markers.

@@FILE /path/to/file.js
@@DESC One short sentence in Romanian, written for someone who cannot read code, saying what you did in this file.
@@CODE
<the full content of the file>
@@ENDFILE

Repeat that block for every file you write. After the very last file, output one line:

@@SUMMARY One short sentence in Romanian telling the user the app is ready.

Rules:
- Always write /App.js. It must export the root React component as default.
- Split the app into several small files instead of one big one: UI pieces go in /components/Name.js (PascalCase, default export), data and helpers in /lib/name.js.
- Import with relative paths from the project root, e.g. import Header from "./components/Header";
- Style only with Tailwind utility classes (Tailwind is already loaded). Do not write CSS files and do not import anything except react and your own files.
- Never write a line that starts with @@ inside a file's content.
- The code must run as-is: every component you import must be a file you wrote.`;

type StreamEvent =
  | { type: "file_start"; path: string; description: string }
  | { type: "file"; path: string; description: string; code: string; lines: number }
  | { type: "summary"; text: string }
  | { type: "error"; message: string };

function normalizePath(raw: string): string {
  const cleaned = raw.trim().replace(/^["'`]|["'`]$/g, "");
  return cleaned.startsWith("/") ? cleaned : "/" + cleaned;
}

function stripFences(text: string): string {
  return text
    .replace(/^```[\w]*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 32000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const send = (event: StreamEvent) =>
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

        let open: { path: string; description: string; code: string[] } | null = null;
        let inCode = false;
        let fileCount = 0;
        let raw = "";

        const closeFile = () => {
          if (!open) return;
          const code = open.code.join("\n").replace(/\s+$/, "");
          fileCount++;
          send({
            type: "file",
            path: open.path,
            description: open.description,
            code,
            lines: code ? code.split("\n").length : 0,
          });
          open = null;
          inCode = false;
        };

        const handleLine = (line: string) => {
          if (line.startsWith("@@FILE")) {
            closeFile();
            open = { path: normalizePath(line.slice(6)), description: "", code: [] };
            return;
          }
          if (line.startsWith("@@DESC")) {
            if (open) open.description = line.slice(6).trim();
            return;
          }
          if (line.trim() === "@@CODE") {
            inCode = true;
            if (open) {
              send({ type: "file_start", path: open.path, description: open.description });
            }
            return;
          }
          if (line.trim() === "@@ENDFILE") {
            closeFile();
            return;
          }
          if (line.startsWith("@@SUMMARY")) {
            closeFile();
            send({ type: "summary", text: line.slice(9).trim() });
            return;
          }
          if (inCode && open) open.code.push(line);
        };

        try {
          let buffer = "";
          for await (const event of stream) {
            if (event.type !== "content_block_delta" || event.delta.type !== "text_delta") {
              continue;
            }
            raw += event.delta.text;
            buffer += event.delta.text;

            let nl = buffer.indexOf("\n");
            while (nl !== -1) {
              handleLine(buffer.slice(0, nl));
              buffer = buffer.slice(nl + 1);
              nl = buffer.indexOf("\n");
            }
          }
          if (buffer) handleLine(buffer);
          closeFile();

          // The model ignored the format — keep the app working with a single file.
          if (fileCount === 0) {
            const code = stripFences(raw);
            if (code) {
              send({
                type: "file",
                path: "/App.js",
                description: "Am scris aplicația.",
                code,
                lines: code.split("\n").length,
              });
            }
          }

          controller.close();
        } catch (err) {
          send({
            type: "error",
            message: err instanceof Error ? err.message : "Generation failed",
          });
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return new Response(
        JSON.stringify({ error: "Rate limit reached, try again later" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({ error: "Generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
