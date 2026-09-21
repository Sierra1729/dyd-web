import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function downloadOrOpenPdf(url: string, defaultFilename = "Resume.pdf", openInNewTab = false) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch file");

    const blob = await res.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    const safeName = defaultFilename.endsWith(".pdf") ? defaultFilename : `${defaultFilename}.pdf`;

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (openInNewTab) {
      window.open(blobUrl, "_blank");
    }

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000);
    return true;
  } catch (err) {
    console.warn("PDF blob download failed, falling back to window.open:", err);
    window.open(url, "_blank");
    return false;
  }
}
