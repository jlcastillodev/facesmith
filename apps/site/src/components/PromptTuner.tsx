import { useMemo, useState, type FC } from 'react';
import { CATEGORIES, type PromptCategory } from '@/lib/prompts/categories';
import { buildGenerationPlan } from '@/lib/generate';
import { downloadDataUrl } from '@/lib/download';
import { CategoryPicker } from './CategoryPicker';
import { AvatarCard } from './AvatarCard';

export interface PromptTunerProps {
  categories?: PromptCategory[];
  defaultPrompt?: string;
  defaultCategoryId?: string;
}

export const PromptTuner: FC<PromptTunerProps> = ({
  categories = CATEGORIES,
  defaultPrompt = 'Original hero portrait, confident expression',
  defaultCategoryId = CATEGORIES[0]?.id ?? 'painterly',
}) => {
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [promptInput, setPromptInput] = useState(defaultPrompt);

  const plan = useMemo(() => buildGenerationPlan(promptInput, categoryId), [promptInput, categoryId]);

  const handleDownload = async () => {
    await downloadDataUrl(plan.placeholderImage, `${plan.category.id}-${plan.safePrompt}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg text-slate-900 dark:text-slate-100">Prompt designer</h2>
        <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
        <label className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          Description
          <textarea
            value={promptInput}
            onChange={(event) => setPromptInput(event.target.value)}
            rows={4}
            spellCheck="false"
            className="min-h-[120px] rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Prompts are sanitized for IP safety. Any blocked references will be removed automatically before reaching an AI model.
        </p>
      </section>
      <AvatarCard
        image={plan.placeholderImage}
        prompt={plan.safePrompt}
        category={plan.category}
        flaggedTerms={plan.flaggedTerms}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default PromptTuner;
