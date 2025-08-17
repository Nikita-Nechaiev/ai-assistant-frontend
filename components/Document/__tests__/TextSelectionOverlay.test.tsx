import React from 'react';

import { render, screen, fireEvent, act } from '@testing-library/react';

import TextSelectionOverlay from '../TextSelectionOverlay';

const rect = new DOMRect(100, 100, 300, 50);

const findMask = () =>
  Array.from(document.body.querySelectorAll('div')).find(
    (el) => (el as HTMLElement).style.backgroundColor === 'rgba(0, 0, 0, 0.6)',
  ) as HTMLElement;

describe('TextSelectionOverlay', () => {
  const onCancel = jest.fn();
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => jest.useRealTimers());

  const mount = (p?: Partial<React.ComponentProps<typeof TextSelectionOverlay>>) =>
    render(
      <TextSelectionOverlay
        qlRect={rect}
        hasSelectedText={false}
        onCancel={onCancel}
        onSubmit={onSubmit}
        isLoading={false}
        {...p}
      />,
    );

  it('fades-in after mount', () => {
    mount();

    const mask = findMask();

    expect(mask).toBeTruthy();
    expect(mask.style.opacity).toBe('0');

    act(() => jest.advanceTimersByTime(20));
    expect(mask.style.opacity).toBe('1');
  });

  it('Cancel button triggers onCancel', () => {
    mount();
    act(() => jest.advanceTimersByTime(20));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Submit disabled when no text, enabled when selected', () => {
    const { rerender } = mount({ hasSelectedText: false });

    act(() => jest.advanceTimersByTime(20));

    const submit = screen.getByRole('button', { name: 'Submit' });

    expect(submit).toBeDisabled();

    rerender(
      <TextSelectionOverlay qlRect={rect} hasSelectedText onCancel={onCancel} onSubmit={onSubmit} isLoading={false} />,
    );
    act(() => jest.advanceTimersByTime(20));

    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows “Processing…” while loading', () => {
    mount({ hasSelectedText: true, isLoading: true });
    act(() => jest.advanceTimersByTime(20));
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument();
  });
});
