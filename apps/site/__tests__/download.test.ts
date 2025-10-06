import { downloadDataUrl } from '../src/lib/download';
import { saveAs } from 'file-saver';

declare global {
  interface Window {
    __downloadDataUrl?: typeof downloadDataUrl;
  }
}

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

describe('downloadDataUrl', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue(new Blob()),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    }
  });

  it('downloads a data URL without throwing', async () => {
    await expect(downloadDataUrl('data:image/png;base64,AAAA', 'avatar.png')).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,AAAA');
    expect(saveAs).toHaveBeenCalledTimes(1);
  });
});
