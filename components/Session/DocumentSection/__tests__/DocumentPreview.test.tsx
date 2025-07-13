import React from 'react';

import { render, screen } from '@testing-library/react';

import DocumentPreview from '../DocumentPreview';

/* ------------------------------------------------------------------ */
/*                                tests                               */
/* ------------------------------------------------------------------ */
describe('DocumentPreview', () => {
  it('injects given rich HTML into the preview container', () => {
    const html = '<h1>Title</h1><p><strong>bold text</strong></p>';

    const { container } = render(<DocumentPreview richContent={html} />);

    // the outermost wrapper is the first div rendered by the component
    const wrapper = container.firstChild as HTMLElement;

    // innerHTML should be exactly what we passed
    expect(wrapper.querySelector('div')!.innerHTML).toBe(html);

    // make sure the heading and bold text are present for good measure
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('bold text')).toBeInTheDocument();
  });

  it('applies the expected Tailwind classes for sizing / overflow', () => {
    render(<DocumentPreview richContent='<p>preview</p>' />);

    const wrapper = screen.getByText('preview').parentElement!.parentElement!;

    // a quick spot-check of a couple of important classes
    expect(wrapper).toHaveClass('h-[209px]');
    expect(wrapper).toHaveClass('overflow-hidden');
    expect(wrapper).toHaveClass('rounded-t-md');
  });
});
