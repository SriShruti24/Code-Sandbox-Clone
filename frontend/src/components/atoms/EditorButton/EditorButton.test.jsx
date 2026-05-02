import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditorButton } from './EditorButton';

// Mock FileIcon to simplify the test
vi.mock('../FileIcon/FileIcon', () => ({
  FileIcon: () => <span data-testid="file-icon">Icon</span>,
}));

describe('EditorButton', () => {
  const defaultProps = {
    name: 'App.jsx',
    extension: 'jsx',
    isActive: false,
    onSelect: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders the file name', () => {
    render(<EditorButton {...defaultProps} />);
    expect(screen.getByText('App.jsx')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(<EditorButton {...defaultProps} />);
    fireEvent.click(screen.getByText('App.jsx').parentElement);
    expect(defaultProps.onSelect).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<EditorButton {...defaultProps} />);
    fireEvent.click(screen.getByTitle('Close'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('applies active class when isActive is true', () => {
    const { container } = render(<EditorButton {...defaultProps} isActive={true} />);
    expect(container.firstChild).toHaveClass('active');
  });
});
