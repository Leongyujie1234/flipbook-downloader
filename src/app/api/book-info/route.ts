import { NextRequest, NextResponse } from "next/server";
import { parseFlipbookUrl, getConfigUrl } from "@/lib/url-parser";
import { extractBookInfo, BookInfo } from "@/lib/config-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing 'url' field" }, { status: 400 });
    }

    const parsed = parseFlipbookUrl(url);
    const configUrl = getConfigUrl(parsed);

    const resp = await fetch(configUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Failed to fetch config.js: ${resp.status} ${resp.statusText}` },
        { status: 502 }
      );
    }

    const jsText = await resp.text();
    const bookInfo: BookInfo = extractBookInfo(jsText, parsed);

    return NextResponse.json(bookInfo);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
