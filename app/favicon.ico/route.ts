import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const file = await fs.readFile(
    path.join(process.cwd(), "public/icon.png")
  );
  return new Response(file, {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
