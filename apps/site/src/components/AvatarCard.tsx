import { type FC } from 'react';
import type { PromptCategory } from '@/lib/prompts/categories';

export interface AvatarCardProps {
  image: string;
  prompt: string;
  category: PromptCategory;
  flaggedTerms: string[];
  onDownload: () => Promise<void> | void;
}

export const AvatarCard: FC<AvatarCardProps> = ({ image, prompt, category, flaggedTerms, onDownload }) => (
  <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-display text-lg text-slate-900 dark:text-slate-100">Preview</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{category.label}</p>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        Download
      </button>
    </div>
    <img
      src={image}
      alt={`${category.label} avatar preview`}
      className="h-64 w-full rounded-lg border border-slate-100 object-cover shadow-inner dark:border-slate-800"
      loading="lazy"
    />
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
  </section>
);

export default AvatarCard;
