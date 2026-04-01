import { type ChangeEvent, type FC } from 'react';
import type { PromptCategory } from '@/lib/prompts/categories';

export interface CategoryPickerProps {
  categories: PromptCategory[];
  value: string;
  onChange: (categoryId: string) => void;
}

export const CategoryPicker: FC<CategoryPickerProps> = ({ categories, value, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value.trim();
    onChange(nextValue);
  };

  return (
    <label className="flex w-full flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
      Avatar style
      <select
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        value={value}
        onChange={handleChange}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {categories.find((category) => category.id === value)?.description ?? 'Select an avatar direction.'}
      </span>
    </label>
  );
};

export default CategoryPicker;
