import { __testing } from '../src/lib/generate';

describe('generate.ts internals', () => {
  const { normaliseImages } = __testing;

  it('normalises base64 strings and trims whitespace', () => {
    const result = normaliseImages({
      images: ['  data:image/png;base64,example  ', 'YmFzZTY0LWRhdGE='],
    });

    expect(result).toEqual([
      'data:image/png;base64,example',
      'data:image/png;base64,YmFzZTY0LWRhdGE=',
    ]);
  });

  it('filters out non-string values and empty entries', () => {
    const result = normaliseImages({
      images: [' ', null, undefined, 42, 'data:image/jpeg;base64,hello'],
    } as unknown);

    expect(result).toEqual(['data:image/jpeg;base64,hello']);
  });
});
