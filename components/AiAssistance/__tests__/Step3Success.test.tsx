import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import Step3Success from '../Step3Success';

describe('Step3Success', () => {
  const onCopyMock = jest.fn();
  const onRestartMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders result text and handles copy', () => {
    render(<Step3Success result='Hello AI!' onCopyResult={onCopyMock} onRestart={onRestartMock} />);

    expect(screen.getByText('Hello AI!')).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /copy/i });

    expect(copyBtn).not.toBeDisabled();

    fireEvent.click(copyBtn);
    expect(onCopyMock).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder and disables copy when result undefined', () => {
    render(<Step3Success result={undefined} onCopyResult={onCopyMock} onRestart={onRestartMock} />);

    expect(screen.getByText('No result available')).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /copy/i });

    expect(copyBtn).toBeDisabled();

    fireEvent.click(copyBtn);
    expect(onCopyMock).not.toHaveBeenCalled();
  });

  it('adds scroll class when result is very long', () => {
    const longText = 'x'.repeat(1500);

    render(<Step3Success result={longText} onCopyResult={onCopyMock} onRestart={onRestartMock} />);

    const wrapper = screen.getByText(longText) as HTMLElement;

    expect(wrapper.className).toMatch(/max-h-\[390px\]/);
  });

  it('calls onRestart when “Go back to beginning” clicked', () => {
    render(<Step3Success result='text' onCopyResult={onCopyMock} onRestart={onRestartMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Try another tool/i }));
    expect(onRestartMock).toHaveBeenCalledTimes(1);
  });
});
