import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { CATEGORIES, type PromptCategory } from '@/lib/prompts/categories';
import { buildGenerationPlan, generateAvatars } from '@/lib/generate';
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

  // plan always reflects current form state
  const plan = useMemo(() => buildGenerationPlan(promptInput, categoryId), [promptInput, categoryId]);

  // preview image shown in the card (starts with placeholder, replaced if proxy succeeds)
  const [previewImage, setPreviewImage] = useState<string>(plan.placeholderImage);
  const [isGenerating, setIsGenerating] = useState(false);

  // keep preview in sync when plan changes
  useEffect(() => {
    setPreviewImage(plan.placeholderImage);
  }, [plan.placeholderImage]);

  // broadcast whenever the preview changes (and/or when generations happen)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const event = new CustomEvent('facesmith:avatars-generated', {
      detail: { avatars: [{ filename: 'avatar-1.png', dataUrl: previewImage }] },
    });
    window.dispatchEvent(event);
  }, [previewImage]);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Ask the proxy for up to 6 images (respects internal max of 8)
      const result = await generateAvatars(plan, { count: 6 });

      // If we got real images, update preview to the first one and download them
      if (result.images.length > 0) {
        setPreviewImage(result.images[0]);

        // download all images returned by the proxy
        result.images.forEach((img, i) => {
          downloadDataUrl(img, `facesmith-${i + 1}.png`);
        });

        // also rebroadcast the generated batch
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('facesmith:avatars-generated', {
            detail: {
              avatars: result.images.map((img, i) => ({
                filename: `facesmith-${i + 1}.png`,
                dataUrl: img,
              })),
              usedProxy: result.usedProxy,
            },
          });
          window.dispatchEvent(event);
        }
        return;
      }

      // fallback: download the placeholder
      downloadDataUrl(plan.placeholderImage, 'avatar-1.png');
    } finally {
      setIsGenerating(false);
    }
  }, [plan]);

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
        image={previewImage}            // show generated image if available
        prompt={plan.safePrompt}
        category={plan.category}
        flaggedTerms={plan.flaggedTerms}
        onDownload={handleDownload}     // now triggers real generation + downloads
      />
    </div>
  );
};

export default PromptTuner;