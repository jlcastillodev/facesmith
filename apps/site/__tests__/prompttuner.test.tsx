import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptTuner } from '../src/components/PromptTuner';
import { generateAvatars } from '../src/lib/generate';

jest.mock('../src/lib/download', () => ({
  downloadDataUrl: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/generate', () => {
  const actual = jest.requireActual('../src/lib/generate');
  return {
    ...actual,
    generateAvatars: jest.fn(),
  };
});

const mockedGenerate = generateAvatars as jest.MockedFunction<typeof generateAvatars>;

beforeEach(() => {
  mockedGenerate.mockReset();
});

describe('PromptTuner', () => {
  it('sanitizes prompts and exposes the cleaned prompt', async () => {
    mockedGenerate.mockResolvedValue({ images: [], usedProxy: false });

    render(<PromptTuner />);

    const textarea = screen.getByLabelText('Description');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Mickey Mouse hero in neon city');

    const safePrompt = await screen.findByText(/painterly digital art/i);
    expect(safePrompt).not.toHaveTextContent(/mickey/i);

    const warning = screen.getByText(/blocked terms removed/i);
    expect(warning).toHaveTextContent('mickey mouse');
  });

  it('transitions through loading and renders downloads after a successful batch', async () => {
    mockedGenerate.mockResolvedValue({
      usedProxy: true,
      images: ['data:image/png;base64,first', 'data:image/png;base64,second'],
    });

    render(<PromptTuner />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateButton);

    expect(mockedGenerate).toHaveBeenCalledTimes(1);
    expect(mockedGenerate).toHaveBeenCalledWith(expect.any(Object), { count: 6 });
    expect(generateButton).toBeDisabled();

    const downloadAll = await screen.findByRole('button', { name: /download all generated avatars/i });
    expect(downloadAll).toBeInTheDocument();

    const preview = screen.getByRole('img', { name: /avatar preview/i });
    expect(preview).toHaveAttribute('src', 'data:image/png;base64,first');

    const thumbnails = await screen.findAllByRole('img', { name: /generated avatar/i });
    expect(thumbnails).toHaveLength(2);
  });

  it('hides download controls and reverts to placeholders on errors', async () => {
    mockedGenerate.mockResolvedValue({
      usedProxy: false,
      images: ['data:image/png;base64,placeholder'],
    });

    render(<PromptTuner />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateButton);

    expect(mockedGenerate).toHaveBeenCalledTimes(1);

    await screen.findByText(/generation failed/i);

    expect(screen.queryByRole('button', { name: /download all/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download avatar/i })).not.toBeInTheDocument();
  });

  it('keeps the previous preview visible while a new batch is generating', async () => {
    mockedGenerate
      .mockResolvedValueOnce({
        usedProxy: true,
        images: ['data:image/png;base64,batch-one', 'data:image/png;base64,batch-one-b'],
      })
      .mockImplementationOnce(() =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              usedProxy: true,
              images: ['data:image/png;base64,batch-two', 'data:image/png;base64,batch-two-b'],
            });
          }, 0);
        }),
      );

    render(<PromptTuner />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateButton);
    await screen.findByRole('button', { name: /download all generated avatars/i });

    const preview = screen.getByRole('img', { name: /avatar preview/i });
    expect(preview).toHaveAttribute('src', 'data:image/png;base64,batch-one');

    await userEvent.click(generateButton);
    expect(generateButton).toBeDisabled();
    expect(preview).toHaveAttribute('src', 'data:image/png;base64,batch-one');
    expect(screen.queryByRole('button', { name: /download all/i })).not.toBeInTheDocument();

    await screen.findByRole('button', { name: /download all generated avatars/i });
    expect(preview).toHaveAttribute('src', 'data:image/png;base64,batch-two');
  });
});
