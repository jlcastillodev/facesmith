import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptTuner } from '../src/components/PromptTuner';

jest.mock('../src/lib/download', () => ({
  downloadDataUrl: jest.fn().mockResolvedValue(undefined),
}));

describe('PromptTuner', () => {
  it('sanitizes prompts and exposes the cleaned prompt', async () => {
    render(<PromptTuner />);

    const textarea = screen.getByLabelText('Description');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Mickey Mouse hero in neon city');

    const safePrompt = await screen.findByText(/painterly digital art/i);
    expect(safePrompt).not.toHaveTextContent(/mickey/i);

    const warning = screen.getByText(/blocked terms removed/i);
    expect(warning).toHaveTextContent('mickey mouse');
  });
});
