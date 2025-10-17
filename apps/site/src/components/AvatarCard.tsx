import { type FC } from 'react';
import type { PromptCategory } from '@/lib/prompts/categories';

export interface AvatarCardProps {
  image: string;
  prompt: string;
  category: PromptCategory;
  flaggedTerms: string[];
  onGenerate?: () => Promise<void> | void;
  loading?: boolean;
  statusMessage?: string;
}

export const AvatarCard: FC<AvatarCardProps> = ({
  image,
  prompt,
  category,
  flaggedTerms,
  onGenerate,
  loading = false,
  statusMessage = '',
}) => (
  <section
    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    aria-busy={loading}
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-display text-lg text-slate-900 dark:text-slate-100">Preview</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{category.label}</p>
      </div>
      <div className="flex items-center gap-2">
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            aria-label="Generate a new batch of avatars"
            className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
          >
            Generate
          </button>
        )}
      </div>
    </div>
    <div className="relative">
      <img
        src={image}
        alt={`${category.label} avatar preview`}
        className="aspect-square rounded-lg border border-slate-100 object-cover shadow-inner dark:border-slate-800 mx-auto"
        loading="lazy"
      />
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-900/60" aria-hidden="true">
          <svg
            className="h-10 w-10 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : null}
    </div>
    <div className="space-y-2">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        <span className="font-semibold">Safe prompt:</span> {prompt}
      </p>
      {flaggedTerms.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          ⚠️ Blocked terms removed: {flaggedTerms.join(', ')}
        </p>
      )}
    </div>
    <p className="sr-only" role="status" aria-live="polite">
      {statusMessage}
    </p>
  </section>
);

export default AvatarCard;
