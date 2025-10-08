import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { CATEGORIES, type PromptCategory } from '@/lib/prompts/categories';
import { buildGenerationPlan, generateAvatars } from '@/lib/generate';
import { downloadDataUrl } from '@/lib/download';
import { CategoryPicker } from './CategoryPicker';
import { AvatarCard } from './AvatarCard';
import { GeneratedGrid } from './GeneratedGrid';
import { DownloadAll } from './DownloadAll';

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
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [phase, setPhase] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const isGenerating = phase === 'generating';

  // keep placeholder in sync when no successful batch exists
  useEffect(() => {
    if (phase === 'ready' || generatedImages.length > 0) {
      return;
    }

    setPreviewImage(plan.placeholderImage);
    setStatusMessage('');
  }, [generatedImages.length, phase, plan.placeholderImage]);

  const handleGenerate = useCallback(async () => {
    setPhase('generating');
    setStatusMessage('Generating…');
    try {
      const result = await generateAvatars(plan, { count: 12 });

      if (result.usedProxy && result.images.length > 0) {
        setGeneratedImages(result.images);
        setPreviewImage(result.images[0]);
        setPhase('ready');
        setStatusMessage(`${result.images.length} images generated.`);

        if (typeof window !== 'undefined') {
          const event = new CustomEvent('facesmith:avatars-generated', {
            detail: {
              avatars: result.images.map((dataUrl, i) => ({
                filename: `facesmith-${i + 1}.png`,
                dataUrl,
              })),
              usedProxy: result.usedProxy,
            },
          });
          window.dispatchEvent(event);
        }

        return;
      }

      setGeneratedImages([]);
      setPreviewImage(plan.placeholderImage);
      setPhase('error');
      setStatusMessage('Generation failed. Showing placeholders.');
    } catch (error) {
      setGeneratedImages([]);
      setPreviewImage(plan.placeholderImage);
      setPhase('error');
      setStatusMessage('Generation failed. Showing placeholders.');
    }
  }, [plan]);

  const handleDownloadAll = useCallback(() => {
    if (!generatedImages.length) {
      return;
    }

    // Use the DownloadAll component's functionality for zip download
    const downloadItems = generatedImages.map((img, index) => ({
      filename: `facesmith-${index + 1}.png`,
      dataUrl: img
    }));

    // For now, download individual files (zip download will work via DownloadAll component)
    generatedImages.forEach((img, index) => {
      downloadDataUrl(img, `facesmith-${index + 1}.png`);
    });
  }, [generatedImages]);

  const handleDownloadOne = useCallback(
    (index: number) => {
      const image = generatedImages[index];
      if (!image) {
        return;
      }

      downloadDataUrl(image, `facesmith-${index + 1}.png`);
    },
    [generatedImages],
  );

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

      <div className="flex flex-col gap-4">
        <AvatarCard
          image={previewImage}
          prompt={plan.safePrompt}
          category={plan.category}
          flaggedTerms={plan.flaggedTerms}
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
          loading={isGenerating}
          statusMessage={statusMessage}
        />
        {generatedImages.length > 0 ? (
          <>
            <GeneratedGrid
              images={generatedImages}
              onDownload={handleDownloadOne}
              showDownloads={phase === 'ready'}
            />
            {phase === 'ready' && (
              <div className="flex justify-center">
                <DownloadAll 
                  items={generatedImages.map((img, index) => ({
                    filename: `facesmith-${index + 1}.png`,
                    dataUrl: img
                  }))}
                />
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PromptTuner;