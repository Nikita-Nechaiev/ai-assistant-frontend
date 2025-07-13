// components/Session/DocumentSection/__tests__/DocumentItem.test.tsx
import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { IDocument } from '@/models/models';

import DocumentItem from '../DocumentItem';

/* ------------------------------------------------------------------ */
/*                 1 — mocks for nested / framework bits              */
/* ------------------------------------------------------------------ */

// next/link → plain <a>
jest.mock('next/link', () => ({ href, children }: any) => (
  <a href={href} data-testid='link'>
    {children}
  </a>
));

// TruncatedText → renders its text prop verbatim
jest.mock('@/ui/TruncateText', () => ({
  __esModule: true,
  default: ({ text }: any) => <span data-testid='truncated'>{text}</span>,
}));

// DocumentPreview – just a coloured div (content not important here)
jest.mock('../DocumentPreview', () => ({
  __esModule: true,
  default: () => <div data-testid='preview'>preview</div>,
}));

/**
 * We’ll spy on props handed to PopupMenu to assert interactions.
 * The component simply shows a <div> so it’s easy to query.
 */
const popupProps: any[] = [];

jest.mock('../PopupMenu', () => ({
  __esModule: true,
  default: (props: any) => {
    popupProps.push(props);

    return <div data-testid='popup'>popup</div>;
  },
}));

/* ------------------------------------------------------------------ */
/*                            test helpers                            */
/* ------------------------------------------------------------------ */
const mkDoc = (id = 10): IDocument => ({
  id,
  title: 'Very long document name to truncate',
  richContent: '<p>Hello</p>',
  createdAt: new Date('2025-07-11T10:00:00Z'),
  lastUpdated: new Date('2025-07-11T10:00:00Z'),
});

const mkSessionId = 123;

/* ------------------------------------------------------------------ */
/*                                tests                               */
/* ------------------------------------------------------------------ */
describe('DocumentItem', () => {
  afterEach(() => popupProps.splice(0, popupProps.length));

  it('renders preview-link, truncated title and date', () => {
    const doc = mkDoc();

    render(<DocumentItem document={doc} sessionId={mkSessionId} onEditTitle={jest.fn()} />);

    // link points to /session/{id}/document/{docId}
    expect(screen.getByTestId('link')).toHaveAttribute('href', `/session/${mkSessionId}/document/${doc.id}`);

    // truncated text component received full title
    expect(screen.getByTestId('truncated')).toHaveTextContent(doc.title);

    // formatted date visible
    const formatted = new Date(doc.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    expect(screen.getByText(formatted)).toBeInTheDocument();

    // preview stub present
    expect(screen.getByTestId('preview')).toBeInTheDocument();
  });

  it('shows PopupMenu on ellipsis click and forwards correct props', () => {
    const onEdit = jest.fn();
    const doc = mkDoc(77);

    render(<DocumentItem document={doc} sessionId={111} onEditTitle={onEdit} />);

    // ellipsis button has empty accessible name => use {name: ''}
    fireEvent.click(screen.getByRole('button', { name: '' }));

    // popup rendered
    expect(screen.getByTestId('popup')).toBeInTheDocument();

    // last captured props belong to this popup
    const { documentId, onEditTitle } = popupProps.at(-1)!;

    expect(documentId).toBe(doc.id);

    // clicking “Rename” inside the popup would normally call onEditTitle;
    // we just test the prop is wired correctly
    onEditTitle();
    expect(onEdit).toHaveBeenCalled();
  });
});
