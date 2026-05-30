import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a React developer. Return ONLY pure React code for a single App.js file. No explanations, no markdown, no code blocks, no backticks. Just the raw JavaScript/JSX code starting with imports or the component definition. The code must be a complete, working React component exported as default.";

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
      max_tokens: 4096,
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
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
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
