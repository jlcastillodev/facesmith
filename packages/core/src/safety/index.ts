export const BLOCKLIST = [
  'mickey mouse',
  'spider-man',
  'spiderman',
  'harry potter',
  'disney',
  'star wars',
  'pokemon',
  'barbie',
  'marvel',
  'dc comics',
  'lord of the rings'
];

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const stripHtml = (value: string) => value.replace(/[<>]/g, '');

export interface SafetyResult {
  prompt: string;
  flaggedTerms: string[];
  original: string;
}

export const detectBlocklistedTerms = (input: string): string[] => {
  const normalized = normalizeWhitespace(input).toLowerCase();
  return BLOCKLIST.filter((term) => normalized.includes(term));
};

export const rewritePrompt = (input: string, categoryLabel?: string): string => {
  const base = normalizeWhitespace(stripHtml(input));
  if (!base) {
    return categoryLabel ? `${categoryLabel} avatar portrait` : 'original character portrait';
  }

  const safe = BLOCKLIST.reduce(
    (current, term) => current.replace(new RegExp(term, 'gi'), '').trim(),
    base
  );

  if (safe.length === 0) {
    return categoryLabel ? `${categoryLabel} avatar portrait` : 'original character portrait';
  }

  return normalizeWhitespace(safe);
};

export const cleanPrompt = (input: string, categoryLabel?: string): SafetyResult => {
  const normalizedInput = normalizeWhitespace(stripHtml(input));
  const flaggedTerms = detectBlocklistedTerms(normalizedInput);
  const safePrompt = rewritePrompt(normalizedInput, categoryLabel);

  return {
    prompt: safePrompt,
    flaggedTerms,
    original: normalizedInput,
  };
};

export const isPromptSafe = (input: string): boolean => detectBlocklistedTerms(input).length === 0;
