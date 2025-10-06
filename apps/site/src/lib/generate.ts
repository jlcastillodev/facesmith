import { cleanPrompt } from './safety/ip-safety';
import { getCategoryById, type PromptCategory } from './prompts/categories';

export interface GenerationPlan {
  safePrompt: string;
  flaggedTerms: string[];
  category: PromptCategory;
  placeholderImage: string;
}

export interface AvatarGenerationOptions {
  count?: number;
}

export interface AvatarGenerationResult {
  images: string[];
  usedProxy: boolean;
}

const DEFAULT_IMAGE_COUNT = 6;
const MAX_PROXY_COUNT = 8;

const normaliseApiUrl = (value: string): string => value.replace(/\/+$/, '');

const normaliseImages = (payload: unknown): string[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const candidate = (payload as { images?: unknown }).images;
  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry): entry is string => entry.length > 0)
    .map((entry) =>
      entry.startsWith('data:')
        ? entry
        : `data:image/png;base64,${entry.replace(/^data:[^,]+,/, '')}`,
    );
};

const createPlaceholderBatch = (plan: GenerationPlan, count: number): string[] =>
  Array.from({ length: count }, (_, index) => {
    const suffix = count > 1 ? ` (placeholder ${index + 1})` : '';
    return createPlaceholderImage(`${plan.safePrompt}${suffix}`, plan.category);
  });

const getConfiguredApiUrl = (): string => {
  const value = import.meta.env.PUBLIC_FACESMITH_API_URL;
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const showFallbackToast = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const body = document.body;
  if (!body) {
    return;
  }

  const existing = document.getElementById('facesmith-fallback-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'facesmith-fallback-toast';
  toast.textContent = 'Generation error — using placeholders';
  toast.className =
    'pointer-events-none fixed top-4 right-4 z-50 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-opacity duration-300 opacity-0';

  body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
  });

  window.setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
    window.setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2400);
};

export const generateAvatars = async (
  plan: GenerationPlan,
  options: AvatarGenerationOptions = {},
): Promise<AvatarGenerationResult> => {
  const requestedCount = Math.floor(options.count ?? DEFAULT_IMAGE_COUNT);
  const count = Math.max(1, Math.min(MAX_PROXY_COUNT, requestedCount));
  const placeholders = createPlaceholderBatch(plan, count);
  const apiUrl = getConfiguredApiUrl();

  if (!apiUrl) {
    return { images: placeholders, usedProxy: false };
  }

  try {
    const response = await fetch(`${normaliseApiUrl(apiUrl)}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      body: JSON.stringify({ prompt: plan.safePrompt, n: count }),
    });

    if (!response.ok) {
      showFallbackToast();
      return { images: placeholders, usedProxy: false };
    }

    const payload = await response.json();
    const images = normaliseImages(payload);

    if (!images.length) {
      showFallbackToast();
      return { images: placeholders, usedProxy: false };
    }

    return { images, usedProxy: true };
  } catch (error) {
    showFallbackToast();
    return { images: placeholders, usedProxy: false };
  }
};

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
