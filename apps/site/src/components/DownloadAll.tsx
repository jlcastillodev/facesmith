import { useCallback, type FC } from 'react';
import JSZip from 'jszip';

export interface DownloadItem {
  filename: string;
  dataUrl: string;
}

export interface DownloadAllProps {
  items: DownloadItem[];
}

export const DownloadAll: FC<DownloadAllProps> = ({ items }) => {
  const handleDownloadAll = useCallback(async () => {
    if (!items.length) {
      return;
    }

    try {
      const { saveAs } = await import('file-saver');
      const zip = new JSZip();
      items.forEach(({ filename, dataUrl }) => {
        const [, base64] = dataUrl.split(',');
        if (base64) {
          zip.file(filename, base64, { base64: true });
        }
      });

      if (Object.keys(zip.files).length === 0) {
        return;
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'facesmith-avatars.zip');
    } catch (error) {
      // Swallowing errors keeps the UI resilient if a bulk download fails.
    }
  }, [items]);

  return (
    <button
      type="button"
      aria-label="Download all avatars as a zip archive"
      onClick={handleDownloadAll}
      className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Download all (.zip)
    </button>
  );
};

export default DownloadAll;
