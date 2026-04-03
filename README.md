# FlipBook Downloader

A lightweight, single-file web application to download AnyFlip and FlipHTML5 books as PDF.

## Features
- **Zero Dependencies**: Entirely client-side, no server or build step required.
- **AnyFlip & FlipHTML5 Support**: Automatically parses URLs and fetches configuration.
- **Custom Page Ranges**: Choose exactly which pages to download.
- **Fast**: Concurrent downloading and in-browser PDF generation via `pdf-lib`.

## Deployment
This project is **Vercel-ready** (Zero Config). 

To deploy:
1. Push this repository to GitHub.
2. Link the repository to a new project on [Vercel](https://vercel.com).
3. Vercel will automatically detect the `index.html` and serve it as a static site.

## Local Use
Simply open `index.html` in any modern web browser.
