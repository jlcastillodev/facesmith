import { type FC } from 'react';

export interface GeneratedGridProps {
  images: string[];
  onDownload: (index: number) => void;
  onImageClick?: (index: number) => void;
  showDownloads?: boolean;
}

export const GeneratedGrid: FC<GeneratedGridProps> = ({ images, onDownload, onImageClick, showDownloads = true }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-label="Generated avatars"
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent avatars</h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
        {images.map((image, index) => {
          const displayIndex = index + 1;
          return (
            <li
              key={image ?? `avatar-${displayIndex}`}
              tabIndex={0}
              role="group"
              aria-label={`Generated avatar #${displayIndex}`}
              className="group relative overflow-hidden rounded-lg border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:focus-visible:ring-offset-slate-900"
            >
              <div
                className="aspect-square w-full cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-800"
                onClick={() => onImageClick?.(index)}
              >
                <img
                  src={image}
                  alt={`Generated avatar #${displayIndex}`}
                  className="aspect-square w-full cursor-pointer object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              {showDownloads ? (
                <button
                  type="button"
                  aria-label={`Download avatar #${displayIndex}`}
                  onClick={() => onDownload(index)}
                  className="absolute right-2 top-2 rounded-full bg-slate-900/80 p-2 text-white opacity-0 transition-all duration-200 hover:bg-slate-900 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M12 3v12" />
                    <path d="M6 11l6 6 6-6" />
                    <path d="M5 19h14" />
                  </svg>
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default GeneratedGrid;
