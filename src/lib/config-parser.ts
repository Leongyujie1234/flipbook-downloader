import { ParsedUrl, buildPageUrl } from "./url-parser";

export interface BookInfo {
  title: string;
  totalPages: number;
  pageUrls: string[];
  platform: string;
  id1: string;
  id2: string;
}

function sanitizeTitle(raw: string): string {
  return raw.replace(/[<>:"/\\|?*]/g, "").trim().replace(/\.$/, "") || "Untitled";
}

function parseConfigJson(jsText: string): Record<string, unknown> {
  const start = jsText.indexOf("{");
  const end = jsText.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Could not find a valid JSON object in config.js");
  }
  try {
    return JSON.parse(jsText.slice(start, end + 1));
  } catch {
    throw new Error("Failed to parse config.js as JSON");
  }
}

export function extractBookInfo(configJs: string, parsed: ParsedUrl): BookInfo {
  const config = parseConfigJson(configJs);

  // Extract title
  const meta = config.meta as Record<string, unknown> | undefined;
  const title = sanitizeTitle(
    (meta?.title as string) ||
    (config.title as string) ||
    ((config.bookConfig as Record<string, unknown>)?.bookTitle as string) ||
    "Untitled"
  );

  // Extract page count
  const pageCount =
    (config.totalPageCount as number) ||
    (config.pageCount as number) ||
    (meta?.pageCount as number) ||
    (meta?.totalPageCount as number) ||
    ((config.bookConfig as Record<string, unknown>)?.totalPageCount as number) ||
    ((config.bookConfig as Record<string, unknown>)?.pageCount as number) ||
    ((config.fliphtml5_pages as unknown[])?.length) ||
    0;

  if (pageCount <= 0) {
    throw new Error("Could not determine page count from config.js");
  }

  // Extract page filenames
  let flipPages = (config.fliphtml5_pages as Array<{ n?: string[] }>) || [];
  
  // If fliphtml5_pages is an encoded string (starts with v0100), we can't parse it yet.
  // We'll fallback to numeric naming (1.webp, 2.webp, etc.)
  const isEncoded = typeof config.fliphtml5_pages === 'string' && config.fliphtml5_pages.startsWith('v');
  if (isEncoded) {
    flipPages = []; // Force fallback to numeric naming in the loop below
  }

  const pageUrls: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    const filename = flipPages[i]?.n?.[0] || undefined;
    pageUrls.push(buildPageUrl(parsed, i + 1, filename));
  }

  return {
    title,
    totalPages: pageCount,
    pageUrls,
    platform: parsed.platform,
    id1: parsed.id1,
    id2: parsed.id2,
  };
}
