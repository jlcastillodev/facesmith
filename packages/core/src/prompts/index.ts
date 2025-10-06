export interface PromptCategory {
  id: string;
  label: string;
  description: string;
  promptTemplate: (prompt: string) => string;
}

export const CATEGORIES: PromptCategory[] = [
  {
    id: 'painterly',
    label: 'Painterly',
    description: 'Hand-painted aesthetic with rich textures and soft lighting.',
    promptTemplate: (prompt) => `${prompt}, painterly digital art, volumetric lighting`
  },
  {
    id: 'synthwave',
    label: 'Synthwave',
    description: 'Retro-futuristic neon palette and sharp contrast.',
    promptTemplate: (prompt) => `${prompt}, synthwave grid background, neon lighting`
  },
  {
    id: 'line-art',
    label: 'Line Art',
    description: 'Minimal monochrome illustration with clean lines.',
    promptTemplate: (prompt) => `${prompt}, high contrast line art, white background`
  },
  {
    id: 'clay',
    label: 'Clay Render',
    description: 'Soft 3D clay render with subtle shadows.',
    promptTemplate: (prompt) => `${prompt}, 3d clay render, studio softbox lighting`
  }
];

export const getCategoryById = (id: string): PromptCategory =>
  CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
