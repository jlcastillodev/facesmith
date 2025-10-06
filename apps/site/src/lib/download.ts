import { saveAs } from 'file-saver';

const FALLBACK_FILENAME = 'facesmith-avatar.png';

const sanitizeFileName = (value: string): string => {
  if (!value) {
    return FALLBACK_FILENAME;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return FALLBACK_FILENAME;
  }

  const segments = trimmed.split('.');
  const extension = segments.length > 1 ? segments.pop() ?? '' : '';
  const base = segments.join('.');

  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, '');
  const finalBase = safeBase || 'facesmith-avatar';
  const finalExtension = safeExtension ? `.${safeExtension}` : '.png';

  return `${finalBase}${finalExtension}`;
};

/**
 * Downloads a browser data URL as a file by converting it into a Blob and invoking file-saver.
 * The filename is sanitized to avoid unsafe characters and defaults to a safe fallback when omitted.
 */
export const downloadDataUrl = async (dataUrl: string, filename: string): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const safeName = sanitizeFileName(filename);
    saveAs(blob, safeName);
  } catch (error) {
    // Intentionally swallowed to prevent UI regressions from download failures.
  }
};

export default downloadDataUrl;
