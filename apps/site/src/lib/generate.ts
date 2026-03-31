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
  size?: number; // 256 | 512 | 1024 (default 512)
}

export interface AvatarGenerationResult {
  images: string[];
  usedProxy: boolean;
}

const DEFAULT_IMAGE_COUNT = 6;
const MAX_IMAGE_COUNT = 8; // Maximum images we can generate

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

export const __testing = {
  normaliseImages,
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
  const count = Math.max(1, Math.min(MAX_IMAGE_COUNT, requestedCount)); // Clamp between 1 and 8
  const placeholders = createPlaceholderBatch(plan, count);
  const apiUrl = getConfiguredApiUrl();
  const size = options.size === 256 || options.size === 1024 ? options.size : 512;


  console.log('🎯 generateAvatars: Starting with config', { requestedCount, count, apiUrl });

  if (!apiUrl) {
    console.log('❌ generateAvatars: No API URL configured, using placeholders');
    return { images: placeholders, usedProxy: false };
  }

  try {
    console.log('📡 generateAvatars: Making request to API');
    const response = await fetch(`${normaliseApiUrl(apiUrl)}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      body: JSON.stringify({ prompt: plan.safePrompt, n: count, size }),
    });

    console.log('📨 generateAvatars: Response received', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ generateAvatars: API request failed', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      // For debugging, let's not fallback to placeholders
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const payload = await response.json();
    console.log('📦 generateAvatars: Parsed response payload', payload);
    
    const images = normaliseImages(payload);
    console.log('🖼️ generateAvatars: Normalized images', { count: images.length });

    if (!images.length) {
      console.error('❌ generateAvatars: No valid images in response');
      throw new Error('No valid images in API response');
    }

    console.log('✅ generateAvatars: Success!', { imageCount: images.length });
    return { images, usedProxy: true };
  } catch (error) {
    console.error('💥 generateAvatars: Error occurred', error);
    
    // For debugging, re-throw the error instead of falling back
    throw error;
  }
};

const createPlaceholderImage = (prompt: string, category: PromptCategory): string => {
  // Return path to static placeholder image in public folder
  // You can replace 'avatar-placeholder.svg' with your app logo
  return '/facesmithLogo.png';
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
