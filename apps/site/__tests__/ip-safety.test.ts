import { cleanPrompt, detectBlocklistedTerms, isPromptSafe } from '../src/lib/safety/ip-safety';

describe('IP safety', () => {
  it('detects blocklisted terms', () => {
    const blocked = detectBlocklistedTerms('Epic battle between Spider-Man and dragons');
    expect(blocked).toContain('spider-man');
    expect(isPromptSafe('Spider-Man hero')).toBe(false);
  });

  it('rewrites prompts and strips HTML', () => {
    const result = cleanPrompt('<b>Barbie</b> cyberpunk queen', 'Synthwave');
    expect(result.flaggedTerms).toContain('barbie');
    expect(result.prompt).not.toMatch(/barbie/i);
    expect(result.prompt).toContain('cyberpunk queen');
  });

  it('falls back to a generic prompt when empty', () => {
    const result = cleanPrompt('   ', 'Painterly');
    expect(result.prompt).toBe('Painterly avatar portrait');
    expect(result.flaggedTerms).toEqual([]);
  });
});
