import { render, screen } from '@testing-library/react';

import TruncatedText from '../TruncateText';

describe('TruncatedText', () => {
  const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae.';

  it('renders full text when shorter than maxLength', () => {
    render(<TruncatedText text='short' maxLength={10} />);

    const span = screen.getByText('short');

    expect(span).toBeInTheDocument();
    expect(span).not.toHaveAttribute('title');
  });

  it('truncates and adds ellipsis when longer than maxLength', () => {
    render(<TruncatedText text={longText} maxLength={10} />);
    expect(screen.getByText(/^Lorem ipsu\.\.\.$/)).toBeInTheDocument();
  });

  it('sets title attribute to original text when truncated', () => {
    render(<TruncatedText text={longText} maxLength={10} />);
    expect(screen.getByTitle(longText)).toBeInTheDocument();
  });

  it('accepts additional className and style', () => {
    render(<TruncatedText text='Styled' className='extra' style={{ color: 'red' }} maxLength={10} />);

    const span = screen.getByText('Styled');

    expect(span).toHaveClass('truncate', 'extra');
    expect(span.style.color).toBe('red');
  });
});
