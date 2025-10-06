import { type Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

/****
 * Tailwind configuration scoped to Astro islands. It ships minimal color tokens
 * that align with the ThemeToggle component.
 */
const config = {
  content: ['./src/**/*.{astro,html,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f8fafc',
          dark: '#0f172a',
        },
        foreground: {
          DEFAULT: '#0f172a',
          dark: '#f8fafc',
        },
        primary: {
          DEFAULT: '#6366f1',
          dark: '#818cf8',
        },
        accent: '#14b8a6',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
} satisfies Config;

export default config;
