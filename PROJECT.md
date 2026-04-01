# FlipBook Downloader

Download AnyFlip & FlipHTML5 flipbooks as PDF with custom page ranges.

## How It Works

### Architecture

```
User enters URL → API fetches config.js → Displays book info + page range selector
                                                      ↓
User picks pages → Client fetches images via proxy → Generates PDF in-browser → Downloads
```

### Supported Platforms

| Platform | URL Format | Config Path |
|----------|-----------|-------------|
| AnyFlip | `https://anyflip.com/{id1}/{id2}` | `mobile/javascript/config.js` |
| FlipHTML5 | `https://fliphtml5.com/{id1}/{id2}` | `javascript/config.js` |

### Flow

1. **URL Input** — User pastes a flipbook URL
2. **Book Info** (`/api/book-info`) — Fetches the platform's `config.js`, extracts title, page count, and page image URLs
3. **Page Range** — User selects which pages to download (e.g., 1-5, or all)
4. **Image Proxy** (`/api/proxy-image`) — Proxies page images from the platform CDN to avoid CORS issues. Converts webp → jpg automatically (FlipHTML5 uses webp, pdf-lib only supports jpg/png)
5. **PDF Generation** — Client-side using `pdf-lib`. Fetches images in parallel (5 concurrent), embeds them as PDF pages, triggers browser download

### Tech Stack

- **Next.js 16** (App Router) — Vercel-native
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **pdf-lib** — Client-side PDF generation
- **sharp** — Server-side webp→jpg conversion (bundled with Next.js)

### Key Files

```
src/
├── lib/
│   ├── url-parser.ts       # Parse AnyFlip/FlipHTML5 URLs, build config & page URLs
│   ├── config-parser.ts    # Extract title, page count, filenames from config.js
│   └── pdf-generator.ts    # Generate PDF from image buffers, trigger download
├── app/
│   ├── api/
│   │   ├── book-info/route.ts    # Fetch config.js, return book metadata
│   │   └── proxy-image/route.ts  # Proxy images, convert webp→jpg
│   └── page.tsx            # Main UI
└── components/
    ├── url-input.tsx              # URL input + fetch button
    ├── book-info-card.tsx         # Display book title, page count, platform
    ├── page-range-selector.tsx    # From/To page inputs + presets
    └── download-button.tsx        # Download trigger with progress bar
```

### How Page Images Are Found

Both platforms serve a `config.js` file that contains metadata and page filenames:

- **AnyFlip**: Pages are numbered `1.jpg`, `2.jpg`, etc. in `files/large/` or `files/mobile/`
- **FlipHTML5**: Pages have hashed filenames like `eacb65dd830bf615d463d4f70f8be5a1.webp` in `files/large/`, listed in the `fliphtml5_pages` array in config.js

### Deployment

```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo at vercel.com/new
```

## Current Problem

The `config.js` paths differ between platforms:

- **AnyFlip**: `https://online.anyflip.com/{id1}/{id2}/mobile/javascript/config.js` ✅
- **FlipHTML5**: `https://online.fliphtml5.com/{id1}/{id2}/javascript/config.js` ✅

Both paths are now handled correctly. FlipHTML5 also uses `.webp` images which are converted to `.jpg` server-side via `sharp` in the proxy route.
