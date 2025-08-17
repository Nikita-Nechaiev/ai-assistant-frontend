import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { IDocument } from '@/models/models';

import DocumentList from '../DocumentList';

const createDocMock = jest.fn();
const changeTitleMock = jest.fn();

let docs: IDocument[] = [];

jest.mock('@/hooks/sockets/useDocumentListSocket', () => ({
  useDocumentListSocket: () => ({
    documents: docs,
    createDocument: createDocMock,
    changeDocumentTitle: changeTitleMock,
  }),
}));

jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

jest.mock('@/ui/InputField', () => ({
  __esModule: true,
  default: ({ id, value, onChange }: any) => <input data-testid={id} value={value} onChange={onChange} />,
}));

jest.mock('../DocumentItem', () => ({
  __esModule: true,
  default: ({ document, onEditTitle }: { document: IDocument; onEditTitle: () => void }) => (
    <div data-testid={`doc-${document.id}`} onClick={onEditTitle}>
      {document.title}
    </div>
  ),
}));

const renderList = () => render(<DocumentList sessionId={777} socket={null} />);

const openCreateModal = () => fireEvent.click(screen.getByRole('button', { name: '' }));

describe('DocumentList', () => {
  afterEach(() => {
    jest.clearAllMocks();
    docs = [];
  });

  it('shows “No documents” placeholder when list empty', () => {
    docs = [];
    renderList();

    expect(screen.getByText('No documents found')).toBeInTheDocument();
  });

  it('opens “create” modal and calls createDocument', () => {
    docs = [];
    renderList();

    openCreateModal();
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('documentTitle'), {
      target: { value: '   New Doc   ' },
    });
    fireEvent.click(screen.getByText('Create'));

    expect(createDocMock).toHaveBeenCalledWith('New Doc');
  });

  it('opens “edit title” modal from DocumentItem and calls changeDocumentTitle', () => {
    docs = [{ id: 11, title: 'Old title' } as IDocument];

    renderList();

    fireEvent.click(screen.getByTestId('doc-11'));

    const input = screen.getByTestId('documentTitle');

    expect(input).toHaveValue('Old title');

    fireEvent.change(input, { target: { value: 'New title' } });
    fireEvent.click(screen.getByText('Save'));

    expect(changeTitleMock).toHaveBeenCalledWith(11, 'New title');
  });
});
