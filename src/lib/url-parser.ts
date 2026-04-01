export type Platform = "anyflip" | "fliphtml5";

export interface ParsedUrl {
  platform: Platform;
  id1: string;
  id2: string;
}

export function parseFlipbookUrl(rawUrl: string): ParsedUrl {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("Invalid URL. Please enter a valid AnyFlip or FlipHTML5 URL.");
  }

  const hostname = url.hostname.toLowerCase();
  const pathParts = url.pathname.split("/").filter(Boolean);

  // AnyFlip: anyflip.com/{id1}/{id2} or online.anyflip.com/{id1}/{id2}
  if (hostname.includes("anyflip.com")) {
    if (pathParts.length < 2) {
      throw new Error("Invalid AnyFlip URL. Expected format: https://anyflip.com/{id1}/{id2}");
    }
    return { platform: "anyflip", id1: pathParts[0], id2: pathParts[1] };
  }

  // FlipHTML5: fliphtml5.com/{id1}/{id2} or online.fliphtml5.com/{id1}/{id2}
  if (hostname.includes("fliphtml5.com")) {
    if (pathParts.length < 2) {
      throw new Error("Invalid FlipHTML5 URL. Expected format: https://fliphtml5.com/{id1}/{id2}");
    }
    return { platform: "fliphtml5", id1: pathParts[0], id2: pathParts[1] };
  }

  throw new Error("Unsupported URL. Only AnyFlip and FlipHTML5 URLs are supported.");
}

export function getConfigUrl(parsed: ParsedUrl): string {
  const domain = parsed.platform === "anyflip" ? "online.anyflip.com" : "online.fliphtml5.com";
  // AnyFlip uses mobile/javascript/config.js, FlipHTML5 uses javascript/config.js
  const configPath = parsed.platform === "anyflip" ? "mobile/javascript/config.js" : "javascript/config.js";
  return `https://${domain}/${parsed.id1}/${parsed.id2}/${configPath}`;
}

export function buildPageUrl(parsed: ParsedUrl, pageNum: number, filename?: string): string {
  const domain = parsed.platform === "anyflip" ? "online.anyflip.com" : "online.fliphtml5.com";
  const basePath = `https://${domain}/${parsed.id1}/${parsed.id2}`;

  if (filename) {
    // Clean escaped slashes and relative path prefixes
    let clean = filename.replace(/\\\//g, "/").replace(/\\/g, "/").replace(/\.\.\//g, "").replace(/\.\.\\/g, "/");
    // Remove leading slashes
    clean = clean.replace(/^\/+/, "");
    if (clean.includes("files/large/") || clean.includes("files/mobile/")) {
      return `${basePath}/${clean}`;
    }
    return `${basePath}/files/large/${clean}`;
  }

  // Fallback: numbered jpg (AnyFlip style)
  return `${basePath}/files/large/${pageNum}.jpg`;
}
