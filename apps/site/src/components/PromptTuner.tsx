import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { CATEGORIES, type PromptCategory } from '@/lib/prompts/categories';
import { buildGenerationPlan, generateAvatars } from '@/lib/generate';
import { downloadDataUrl } from '@/lib/download';
import { CategoryPicker } from './CategoryPicker';
import { AvatarCard } from './AvatarCard';
import { GeneratedGrid } from './GeneratedGrid';
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import { DownloadAll } from './DownloadAll';
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours

  // keep placeholder in sync when no successful batch exists
  useEffect(() => {
    if (phase === 'ready' || generatedImages.length > 0) {
      return;
    }
<<<<<<< ours

    setPreviewImage(plan.placeholderImage);
    setStatusMessage('');
  }, [generatedImages.length, phase, plan.placeholderImage]);

=======

    setPreviewImage(plan.placeholderImage);
    setStatusMessage('');
  }, [generatedImages.length, phase, plan.placeholderImage]);

>>>>>>> theirs
=======
=======
>>>>>>> theirs

=======

>>>>>>> theirs
=======

>>>>>>> theirs
=======

>>>>>>> theirs
=======

>>>>>>> theirs
=======

>>>>>>> theirs
  // keep placeholder in sync when no successful batch exists
  useEffect(() => {
    if (phase === 'ready' || generatedImages.length > 0) {
      return;
    }
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours

    setPreviewImage(plan.placeholderImage);
    setStatusMessage('');
  }, [generatedImages.length, phase, plan.placeholderImage]);

>>>>>>> theirs
=======
=======
>>>>>>> theirs

=======

>>>>>>> theirs
    setPreviewImage(plan.placeholderImage);
    setStatusMessage('');
  }, [generatedImages.length, phase, plan.placeholderImage]);

<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
=======
>>>>>>> theirs

=======

>>>>>>> theirs
    setPreviewImage(plan.placeholderImage);
    setStatusMessage('');
  }, [generatedImages.length, phase, plan.placeholderImage]);

<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  const handleGenerate = useCallback(async () => {
    setPhase('generating');
    setStatusMessage('Generating…');
    try {
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      const result = await generateAvatars(plan, { count: 6, size: 512 });
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
      const result = await generateAvatars(plan, { count: 6 });
>>>>>>> theirs

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

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    // Use the DownloadAll component's functionality for zip download
    const downloadItems = generatedImages.map((img, index) => ({
      filename: `facesmith-${index + 1}.png`,
      dataUrl: img
    }));

    // For now, download individual files (zip download will work via DownloadAll component)
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
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

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
  const handleImageClick = useCallback(
    (index: number) => {
      const image = generatedImages[index];
      if (image) {
        setPreviewImage(image);
      }
    },
    [generatedImages],
  );

=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  return (
    <>
      {/* Global blocking overlay during generation */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
            <svg
              className="h-12 w-12 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Generating avatars...</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">This may take a few moments</p>
          </div>
        </div>
      )}
      
      <div className="grid gap-6 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]">
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
            disabled={isGenerating}
            className="min-h-[120px] rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          aria-label="Generate a new batch of avatars"
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-blue-700 dark:focus-visible:ring-offset-slate-900"
        >
          {isGenerating ? 'Generating...' : 'Generate Avatars'}
        </button>
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
>>>>>>> theirs
=======
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
>>>>>>> theirs
=======
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
>>>>>>> theirs
=======
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
>>>>>>> theirs
=======
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
>>>>>>> theirs
=======
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
>>>>>>> theirs
=======
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
>>>>>>> theirs
=======
          onGenerate={handleGenerate}
          onDownloadAll={phase === 'ready' && generatedImages.length > 0 ? handleDownloadAll : undefined}
          canDownload={phase === 'ready' && generatedImages.length > 0}
>>>>>>> theirs
          loading={isGenerating}
          statusMessage={statusMessage}
        />
        {generatedImages.length > 0 ? (
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
          <>
            <GeneratedGrid
              images={generatedImages}
              onDownload={handleDownloadOne}
              onImageClick={handleImageClick}
              showDownloads={phase === 'ready'}
            />
            {phase === 'ready' && (
              <div className="flex justify-center gap-3">
                <DownloadAll 
                  items={generatedImages.map((img, index) => ({
                    filename: `facesmith-${index + 1}.png`,
                    dataUrl: img
                  }))}
                />
              </div>
            )}
          </>
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
          <GeneratedGrid
            images={generatedImages}
            onDownload={handleDownloadOne}
            showDownloads={phase === 'ready'}
          />
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
        ) : null}
      </div>
    </div>
    </>
  );
};

export default PromptTuner;