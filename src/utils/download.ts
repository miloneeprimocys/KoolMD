/**
 * Saves a downloaded file locally. The object URL is released on the next tick: revoking it
 * right after `click()` can cancel the download in some browsers (e.g. Firefox).
 */
export function saveBlobAsFile(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

const SIZE_UNITS = ["B", "KB", "MB", "GB"];

/** 1536 → "1.5 KB" */
export function formatFileSize(bytes: number): string {
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${unitIndex === 0 ? size : size.toFixed(1)} ${SIZE_UNITS[unitIndex]}`;
}
