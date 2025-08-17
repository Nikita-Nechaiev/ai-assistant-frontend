import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { IDocument } from '@/models/models';

import DocumentItem from '../DocumentItem';

jest.mock('next/link', () => ({ href, children }: any) => (
  <a href={href} data-testid='link'>
    {children}
  </a>
));

jest.mock('@/ui/TruncateText', () => ({
  __esModule: true,
  default: ({ text }: any) => <span data-testid='truncated'>{text}</span>,
}));

jest.mock('../DocumentPreview', () => ({
  __esModule: true,
  default: () => <div data-testid='preview'>preview</div>,
}));

const popupProps: any[] = [];

jest.mock('../PopupMenu', () => ({
  __esModule: true,
  default: (props: any) => {
    popupProps.push(props);

    return <div data-testid='popup'>popup</div>;
  },
}));

const mkDoc = (id = 10): IDocument => ({
  id,
  title: 'Very long document name to truncate',
  richContent: '<p>Hello</p>',
  createdAt: new Date('2025-07-11T10:00:00Z'),
  lastUpdated: new Date('2025-07-11T10:00:00Z'),
});

const mkSessionId = 123;

describe('DocumentItem', () => {
  afterEach(() => popupProps.splice(0, popupProps.length));

  it('renders preview-link, truncated title and date', () => {
    const doc = mkDoc();

    render(<DocumentItem document={doc} sessionId={mkSessionId} onEditTitle={jest.fn()} />);

    expect(screen.getByTestId('link')).toHaveAttribute('href', `/session/${mkSessionId}/document/${doc.id}`);

    expect(screen.getByTestId('truncated')).toHaveTextContent(doc.title);

    const formatted = new Date(doc.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    expect(screen.getByText(formatted)).toBeInTheDocument();

    expect(screen.getByTestId('preview')).toBeInTheDocument();
  });

  it('shows PopupMenu on ellipsis click and forwards correct props', () => {
    const onEdit = jest.fn();
    const doc = mkDoc(77);

    render(<DocumentItem document={doc} sessionId={111} onEditTitle={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: '' }));

    expect(screen.getByTestId('popup')).toBeInTheDocument();

    const { documentId, onEditTitle } = popupProps.at(-1)!;

    expect(documentId).toBe(doc.id);

    onEditTitle();
    expect(onEdit).toHaveBeenCalled();
  });
});
