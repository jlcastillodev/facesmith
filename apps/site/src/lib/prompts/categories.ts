// apps/site/src/lib/prompts/categories.ts
export { CATEGORIES, getCategoryById, type PromptCategory } from '@facesmith/core';

export const CATEGORY_BASE_PROMPT: Record<string, string> = {
  'superhero-tech':
    'original character, futuristic powered armor, geometric paneling, dramatic rim light, comic-ink',
  'space-opera':
    'original character, starfarer pilot, reflective visor, deep-space bokeh, cinematic key light',
  'cyberpunk-detective':
    'original character, trench coat, neon rain city, graphic novel, moody atmosphere',
  'fantasy-mage':
    'original character, arcane mage, smoky alley, volumetric light, limited palette',
};