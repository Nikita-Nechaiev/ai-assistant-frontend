import React from 'react';

import { render, screen } from '@testing-library/react';

import DocumentPreview from '../DocumentPreview';

describe('DocumentPreview', () => {
  it('injects given rich HTML into the preview container', () => {
    const html = '<h1>Title</h1><p><strong>bold text</strong></p>';

    const { container } = render(<DocumentPreview richContent={html} />);

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper.querySelector('div')!.innerHTML).toBe(html);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('bold text')).toBeInTheDocument();
  });

  it('applies the expected Tailwind classes for sizing / overflow', () => {
    render(<DocumentPreview richContent='<p>preview</p>' />);

    const wrapper = screen.getByText('preview').parentElement!.parentElement!;

    expect(wrapper).toHaveClass('h-[209px]');
    expect(wrapper).toHaveClass('overflow-hidden');
    expect(wrapper).toHaveClass('rounded-t-md');
  });
});
