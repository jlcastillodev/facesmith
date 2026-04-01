import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'facesmith.theme';

export const ThemeToggle = () => {
  // Always start with light theme to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // After hydration, get the actual preferred theme
    const getPreferredTheme = (): Theme => {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }

      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    };

    const actualTheme = getPreferredTheme();
    setTheme(actualTheme);
    setIsHydrated(true);

    // Apply theme immediately after hydration
    document.documentElement.dataset.theme = actualTheme;
    document.body.dataset.theme = actualTheme;
    document.documentElement.classList.toggle('dark', actualTheme === 'dark');
    document.body.classList.toggle('dark', actualTheme === 'dark');
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Apply theme changes after hydration
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
    
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      // Only update if no stored preference exists
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [isHydrated]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  // Always use consistent labels to avoid hydration mismatch
  const label = theme === 'dark' ? 'Activate light mode' : 'Activate dark mode';

  return (
    <button
      type="button"
      aria-label={label}
      onClick={toggleTheme}
      className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-900 shadow-sm transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

export default ThemeToggle;
