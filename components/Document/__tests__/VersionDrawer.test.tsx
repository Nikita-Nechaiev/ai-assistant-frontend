import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { IDocument, IVersion } from '@/models/models';

import VersionDrawer from '../VersionDrawer';

jest.mock('@/ui/Drawer', () => ({
  __esModule: true,
  default: ({ isOpen, handleClose, children }: any) =>
    isOpen ? (
      <div data-testid='drawer'>
        <button data-testid='drawer-close' onClick={handleClose} />
        {children}
      </div>
    ) : null,
}));

jest.mock('../VersionItem', () => ({
  __esModule: true,
  default: ({ version, onClick, onMouseEnter, onMouseLeave, 'data-testid': _ }: any) => (
    <div
      role='row'
      onClick={() => onClick(version)}
      onMouseEnter={() => onMouseEnter(version)}
      onMouseLeave={onMouseLeave}
    >
      {version.id}
    </div>
  ),
}));

const mkVersion = (id = 1): IVersion => ({
  id,
  userEmail: `user${id}@mail.com`,
  createdAt: new Date('2025-07-10T00:00:00Z'),
  richContent: 'content',
  document: { id: 1 } as IDocument,
});

const versions = [mkVersion(1), mkVersion(2), mkVersion(3)];

describe('VersionDrawer', () => {
  const handleClose = jest.fn();
  const handleSelect = jest.fn();
  const handleApply = jest.fn();
  const setPreview = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders versions list & close button works', () => {
    render(
      <VersionDrawer
        isOpen
        versions={versions}
        previewContent=''
        selectedVersion={null}
        handleSelectVersion={handleSelect}
        handleApplyVersion={handleApply}
        handleClose={handleClose}
        handleSetPreview={setPreview}
      />,
    );

    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);

    fireEvent.click(screen.getByTestId('drawer-close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('apply button disabled when no selected / same as current', () => {
    const { rerender } = render(
      <VersionDrawer
        isOpen
        versions={versions}
        previewContent=''
        selectedVersion={null}
        handleSelectVersion={handleSelect}
        handleApplyVersion={handleApply}
        handleClose={handleClose}
        handleSetPreview={setPreview}
      />,
    );

    const btn = screen.getByRole('button', { name: /apply version/i });

    expect(btn).toBeDisabled();

    rerender(
      <VersionDrawer
        isOpen
        versions={versions}
        previewContent=''
        selectedVersion={versions[0]}
        handleSelectVersion={handleSelect}
        handleApplyVersion={handleApply}
        handleClose={handleClose}
        handleSetPreview={setPreview}
      />,
    );
    expect(btn).toBeDisabled();
  });

  it('enables apply button & propagates callbacks', () => {
    render(
      <VersionDrawer
        isOpen
        versions={versions}
        previewContent=''
        selectedVersion={versions[1]}
        handleSelectVersion={handleSelect}
        handleApplyVersion={handleApply}
        handleClose={handleClose}
        handleSetPreview={setPreview}
      />,
    );

    const row = screen.getAllByRole('row')[2];

    fireEvent.mouseEnter(row);
    expect(setPreview).toHaveBeenCalledWith(versions[2]);

    fireEvent.click(row);
    expect(handleSelect).toHaveBeenCalledWith(versions[2]);

    fireEvent.mouseLeave(row);
    expect(setPreview).toHaveBeenLastCalledWith(versions[1]);

    const btn = screen.getByRole('button', { name: /apply version/i });

    expect(btn).toBeEnabled();

    fireEvent.click(btn);
    expect(handleApply).toHaveBeenCalled();
  });
});
