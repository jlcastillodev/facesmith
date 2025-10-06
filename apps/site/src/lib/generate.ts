import { cleanPrompt } from './safety/ip-safety';
import { getCategoryById, type PromptCategory } from './prompts/categories';

export interface GenerationPlan {
  safePrompt: string;
  flaggedTerms: string[];
  category: PromptCategory;
  placeholderImage: string;
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const createPlaceholderImage = (prompt: string, category: PromptCategory): string => {
  const title = escapeXml(`FaceSmith avatar: ${category.label}`);
  const truncatedPrompt = prompt.length > 80 ? `${prompt.slice(0, 77)}…` : prompt;
  const subtitle = escapeXml(truncatedPrompt);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
    <title id="title">${title}</title>
    <desc id="desc">Placeholder avatar preview</desc>
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#14b8a6" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="48" fill="url(#bg)" />
    <circle cx="256" cy="200" r="104" fill="rgba(15, 23, 42, 0.85)" />
    <path d="M128 420c32-72 108-108 128-108s96 36 128 108" fill="rgba(15, 23, 42, 0.6)" />
    <text x="50%" y="72%" font-family="'Inter',sans-serif" font-size="28" fill="#f8fafc" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const buildGenerationPlan = (rawPrompt: string, categoryId: string): GenerationPlan => {
  const category = getCategoryById(categoryId);
  const safety = cleanPrompt(rawPrompt, category.label);
  const promptForEngine = category.promptTemplate(safety.prompt);
  const placeholderImage = createPlaceholderImage(promptForEngine, category);

  return {
    safePrompt: promptForEngine,
    flaggedTerms: safety.flaggedTerms,
    category,
    placeholderImage,
  };
};
