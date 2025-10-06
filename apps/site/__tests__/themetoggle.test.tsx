import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../src/components/ThemeToggle';

declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }
}

const createMatchMedia = (matches: boolean): MediaQueryList => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(() => false),
} as unknown as MediaQueryList);

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => createMatchMedia(query.includes('dark')));
    localStorage.clear();
    document.documentElement.dataset.theme = 'light';
    document.body.dataset.theme = 'light';
    document.documentElement.className = '';
    document.body.className = '';
  });

  it('toggles between light and dark themes', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /activate dark mode/i });
    await userEvent.click(button);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('facesmith.theme')).toBe('dark');

    await userEvent.click(button);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
