import { renderHook, act } from '@testing-library/react';

import type { IVersion } from '@/models/models';

import useVersionDrawer from '../useVersionDrawer';

const v = (id: number, richContent = `<p>${id}</p>`): IVersion => ({ id, richContent }) as IVersion;

describe('useVersionDrawer', () => {
  const versions = [v(1), v(2)];

  it('exposes initial state', () => {
    const { result } = renderHook(() => useVersionDrawer({ versions, applyVersion: jest.fn() }));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.previewContent).toBe('');
    expect(result.current.selectedVersion).toBeNull();
    expect(result.current.versions).toBe(versions);
  });

  it('open / close toggles and resets state', () => {
    const { result } = renderHook(() => useVersionDrawer({ versions, applyVersion: jest.fn() }));

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.handleSelectVersion(v(2)));
    act(() => result.current.handleSetPreview(v(2)));

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.previewContent).toBe('');
    expect(result.current.selectedVersion).toBeNull();
  });

  it('handleSetPreview copies richContent', () => {
    const { result } = renderHook(() => useVersionDrawer({ versions, applyVersion: jest.fn() }));

    act(() => result.current.handleSetPreview(v(1)));
    expect(result.current.previewContent).toBe('<p>1</p>');
  });

  it('handleApplyVersion calls callback and resets state', () => {
    const apply = jest.fn();
    const { result } = renderHook(() => useVersionDrawer({ versions, applyVersion: apply }));

    act(() => result.current.handleSelectVersion(v(2)));
    act(() => result.current.handleSetPreview(v(2)));

    act(() => result.current.handleApplyVersion());

    expect(apply).toHaveBeenCalledWith(2);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.previewContent).toBe('');
    expect(result.current.selectedVersion).toBeNull();
  });

  it('handleApplyVersion is no-op when no version selected', () => {
    const apply = jest.fn();
    const { result } = renderHook(() => useVersionDrawer({ versions, applyVersion: apply }));

    act(() => result.current.handleApplyVersion());
    expect(apply).not.toHaveBeenCalled();
  });
});
