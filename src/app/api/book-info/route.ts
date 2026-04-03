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
    const primaryConfigUrl = getConfigUrl(parsed);
    
    // Fallback urls: Some FlipHTML5 books use the AnyFlip path structure
    const fallbackUrls = parsed.platform === "fliphtml5" 
      ? [primaryConfigUrl.replace("/javascript/", "/mobile/javascript/")] 
      : [primaryConfigUrl.replace("/mobile/", "/")];

    const allUrls = [primaryConfigUrl, ...fallbackUrls];
    let lastError = "";
    let jsText = "";

    for (const configUrl of allUrls) {
      try {
        const resp = await fetch(configUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (resp.ok) {
          jsText = await resp.text();
          break;
        }
        lastError = `${resp.status} ${resp.statusText} at ${configUrl}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
      }
    }

    if (!jsText) {
      return NextResponse.json(
        { error: `Failed to fetch config.js (tried ${allUrls.length} locations). Last error: ${lastError}` },
        { status: 502 }
      );
    }

    const bookInfo: BookInfo = extractBookInfo(jsText, parsed);

    return NextResponse.json(bookInfo);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
