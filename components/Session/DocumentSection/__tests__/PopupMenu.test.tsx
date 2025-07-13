// components/Session/DocumentSection/__tests__/PopupMenu.test.tsx
import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

////////////////////////////////////////////////////////////////////////////////
// 1 — mock ESM-only dependency *before* PopupMenu gets imported              //
////////////////////////////////////////////////////////////////////////////////
jest.mock('react-quill-new', () => ({
  Quill: {}, // minimal stub – just needs to exist
}));

////////////////////////////////////////////////////////////////////////////////
// 2 — external mocks & spies                                                  //
////////////////////////////////////////////////////////////////////////////////
const onClose = jest.fn();
const onEditTitle = jest.fn();
const duplicateSpy = jest.fn();
const deleteSpy = jest.fn();
const exportToPdfSpy = jest.fn();
const toDeltaSpy = jest.fn((_html: string, _quill: unknown) => 'Δ');
const setSnackbarSpy = jest.fn();
const pushSpy = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushSpy }),
}));

jest.mock('@/hooks/sockets/usePopupMenuSocket', () => ({
  usePopupMenu: () => ({
    duplicateDocument: duplicateSpy,
    deleteDocument: deleteSpy,
  }),
}));

jest.mock('@/helpers/exportToPdf', () => ({
  exportToPDF: (...args: any[]) => exportToPdfSpy(...args),
}));

jest.mock('@/helpers/documentHelpers', () => ({
  convertRichContentToDelta: (html: string, quill: unknown) => toDeltaSpy(html, quill),
}));

jest.mock('@/helpers/RequirePermission', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/store/useSnackbarStore', () => () => ({
  setSnackbar: setSnackbarSpy,
}));

////////////////////////////////////////////////////////////////////////////////
// 3 — component under test                                                    //
////////////////////////////////////////////////////////////////////////////////
import PopupMenu from '../PopupMenu';
import { SessionContext } from '../../SessionLayout/SessionLayout';

////////////////////////////////////////////////////////////////////////////////
// 4 — helper to render with SessionContext                                    //
////////////////////////////////////////////////////////////////////////////////
const renderMenu = (extraProps = {}) =>
  render(
    <SessionContext.Provider value={{ socket: undefined, sessionId: 123 } as any}>
      <div data-testid='outside'>
        <PopupMenu
          documentId={42}
          richContent='<p>demo</p>'
          documentTitle='Doc title'
          onClose={onClose}
          onEditTitle={onEditTitle}
          {...extraProps}
        />
      </div>
    </SessionContext.Provider>,
  );

////////////////////////////////////////////////////////////////////////////////
// 5 — tests                                                                   //
////////////////////////////////////////////////////////////////////////////////
describe('PopupMenu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fires Rename → onEditTitle & onClose', () => {
    renderMenu();
    fireEvent.click(screen.getByText('Rename'));
    expect(onEditTitle).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates on Edit click', () => {
    renderMenu();
    fireEvent.click(screen.getByText('Edit'));
    expect(pushSpy).toHaveBeenCalledWith('/session/123/document/42');
  });

  it('duplicates document then closes', () => {
    renderMenu();
    fireEvent.click(screen.getByText('Duplicate'));
    expect(duplicateSpy).toHaveBeenCalledWith(42);
    expect(onClose).toHaveBeenCalled();
  });

  it('deletes document', () => {
    renderMenu();
    fireEvent.click(screen.getByText('Delete'));
    expect(deleteSpy).toHaveBeenCalledWith(42);
  });

  it('exports PDF – converts to delta then calls export helper', () => {
    renderMenu();
    fireEvent.click(screen.getByText('Export as PDF'));
    expect(toDeltaSpy).toHaveBeenCalledWith('<p>demo</p>', expect.anything());
    expect(exportToPdfSpy).toHaveBeenCalledWith('Doc title', 'Δ', setSnackbarSpy);
  });

  it('closes on outside click', () => {
    renderMenu();
    fireEvent.mouseDown(screen.getByTestId('outside')); // click outside
    expect(onClose).toHaveBeenCalled();
  });
});
