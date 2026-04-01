import { PDFDocument } from "pdf-lib";

export interface GeneratePdfOptions {
  title?: string;
  onProgress?: (current: number, total: number) => void;
}

export async function generatePdfFromImages(
  imageBuffers: ArrayBuffer[],
  options: GeneratePdfOptions = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  if (options.title) {
    pdfDoc.setTitle(options.title);
  }
  pdfDoc.setCreator("FlipBook Downloader");

  for (let i = 0; i < imageBuffers.length; i++) {
    const buffer = imageBuffers[i];
    let image;
    let embedFn: "embedJpg" | "embedPng";

    // Detect image type from first bytes
    const bytes = new Uint8Array(buffer);
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      image = await pdfDoc.embedJpg(buffer);
      embedFn = "embedJpg";
    } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      image = await pdfDoc.embedPng(buffer);
      embedFn = "embedPng";
    } else {
      // Default to JPG
      image = await pdfDoc.embedJpg(buffer);
      embedFn = "embedJpg";
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    options.onProgress?.(i + 1, imageBuffers.length);
  }

  return pdfDoc.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function safeFilename(title: string): string {
  return title.replace(/[^a-zA-Z0-9\-_\s]/g, "").replace(/\s+/g, "_").slice(0, 100) || "flipbook";
}
