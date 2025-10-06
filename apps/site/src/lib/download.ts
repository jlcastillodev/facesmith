const sanitizeFileName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '') || 'facesmith-avatar';

export const downloadDataUrl = async (dataUrl: string, fileStem: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const safeName = `${sanitizeFileName(fileStem)}.svg`;
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = safeName;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  requestAnimationFrame(() => {
    document.body.removeChild(anchor);
  });
};

export default downloadDataUrl;
