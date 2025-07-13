/**
 * @jest-environment jsdom
 */

import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { IDocument } from '@/models/models';

import DocumentList from '../DocumentList';

/* ------------------------------------------------------------------ */
/*                     1 — external mocks & stubs                     */
/* ------------------------------------------------------------------ */

// 🔧  Keep references so we can assert on them later
const createDocMock = jest.fn();
const changeTitleMock = jest.fn();

// a mutable “store” the hook will return – tests mutate it between renders
let docs: IDocument[] = [];

// socket-hook → stub implementation
jest.mock('@/hooks/sockets/useDocumentListSocket', () => ({
  useDocumentListSocket: () => ({
    documents: docs,
    createDocument: createDocMock,
    changeDocumentTitle: changeTitleMock,
  }),
}));

// strip the permission-wrapper for tests
jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Modal – simple container with two buttons for submit / cancel
jest.mock('@/ui/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, title, submitText, onSubmit, onClose, children }: any) =>
    isOpen ? (
      <div data-testid='modal'>
        <h2>{title}</h2>
        {children}
        <button onClick={onSubmit}>{submitText}</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

// InputField – plain <input>
jest.mock('@/ui/InputField', () => ({
  __esModule: true,
  default: ({ id, value, onChange }: any) => <input data-testid={id} value={value} onChange={onChange} />,
}));

// DocumentItem – clickable div that calls onEditTitle when clicked
jest.mock('../DocumentItem', () => ({
  __esModule: true,
  default: ({ document, onEditTitle }: { document: IDocument; onEditTitle: () => void }) => (
    <div data-testid={`doc-${document.id}`} onClick={onEditTitle}>
      {document.title}
    </div>
  ),
}));

/* ------------------------------------------------------------------ */
/*                              helpers                               */
/* ------------------------------------------------------------------ */
const renderList = () => render(<DocumentList sessionId={777} socket={null} />);

const openCreateModal = () => fireEvent.click(screen.getByRole('button', { name: '' }));

/* ------------------------------------------------------------------ */
/*                                 tests                              */
/* ------------------------------------------------------------------ */
describe('DocumentList', () => {
  afterEach(() => {
    jest.clearAllMocks();
    docs = []; // reset between tests
  });

  it('shows “No documents” placeholder when list empty', () => {
    docs = []; // no documents
    renderList();

    expect(screen.getByText('No documents found')).toBeInTheDocument();
  });

  it('opens “create” modal and calls createDocument', () => {
    docs = [];
    renderList();

    // open ➕  button
    openCreateModal();
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // type new title and submit
    fireEvent.change(screen.getByTestId('documentTitle'), {
      target: { value: '   New Doc   ' }, // note the extra spaces
    });
    fireEvent.click(screen.getByText('Create'));

    expect(createDocMock).toHaveBeenCalledWith('New Doc'); // trimmed
  });

  it('opens “edit title” modal from DocumentItem and calls changeDocumentTitle', () => {
    docs = [{ id: 11, title: 'Old title' } as IDocument];

    renderList();

    // click the DocumentItem to trigger edit
    fireEvent.click(screen.getByTestId('doc-11'));

    // modal should pre-fill with existing title
    const input = screen.getByTestId('documentTitle');

    expect(input).toHaveValue('Old title');

    // change title & save
    fireEvent.change(input, { target: { value: 'New title' } });
    fireEvent.click(screen.getByText('Save'));

    expect(changeTitleMock).toHaveBeenCalledWith(11, 'New title');
  });
});
