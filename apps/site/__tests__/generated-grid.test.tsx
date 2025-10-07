import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GeneratedGrid } from '../src/components/GeneratedGrid';

describe('GeneratedGrid', () => {
  it('renders thumbnails and triggers downloads when requested', async () => {
    const handleDownload = jest.fn();
    const images = ['data:image/png;base64,a', 'data:image/png;base64,b'];

    render(<GeneratedGrid images={images} onDownload={handleDownload} />);

    const thumbnails = screen.getAllByRole('img', { name: /generated avatar/i });
    expect(thumbnails).toHaveLength(2);

    const downloadButton = screen.getByRole('button', { name: /download avatar #1/i });
    await userEvent.click(downloadButton);

    expect(handleDownload).toHaveBeenCalledWith(0);
  });

  it('hides download actions when showDownloads is false', () => {
    const images = ['data:image/png;base64,a'];

    render(<GeneratedGrid images={images} onDownload={jest.fn()} showDownloads={false} />);

    expect(screen.queryByRole('button', { name: /download avatar/i })).not.toBeInTheDocument();
  });
});
