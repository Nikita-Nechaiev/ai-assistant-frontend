import { renderHook, act } from '@testing-library/react';

import { SnackbarStatusEnum } from '@/models/enums';
import type { AITool } from '@/models/models';

import useTextSelectionOverlay from '../useTextSelectionOverlay';

const lockSpy = jest.fn();

jest.mock('@/helpers/scrollLock', () => ({
  lockBodyScroll: (...a: any[]) => lockSpy(...a),
}));

const toolNeedsLang = { requiresTargetLanguage: true } as AITool;
const toolFree = { requiresTargetLanguage: false } as AITool;

const qlDiv = document.createElement('div');

qlDiv.className = 'ql-editor';
qlDiv.getBoundingClientRect = () => new DOMRect(0, 0, 100, 50);
document.body.appendChild(qlDiv);

describe('useTextSelectionOverlay', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => jest.useRealTimers());

  it('shows snackbar when tool requires language but none supplied', () => {
    const snackbar = jest.fn();
    const modalSet = jest.fn();

    const { result } = renderHook(() =>
      useTextSelectionOverlay({
        selectedTool: toolNeedsLang,
        targetLanguage: '',
        setSnackbar: snackbar,
        setModalOpen: modalSet,
      }),
    );

    act(() => result.current.handleActivateTextSelection());

    expect(snackbar).toHaveBeenCalledWith('Please specify a target language', SnackbarStatusEnum.ERROR);
    expect(modalSet).not.toHaveBeenCalledWith(false);
  });

  it('activates overlay, closes modal and locks body scroll', () => {
    const modalSet = jest.fn();

    const { result } = renderHook(() =>
      useTextSelectionOverlay({
        selectedTool: toolFree,
        targetLanguage: '',
        setSnackbar: jest.fn(),
        setModalOpen: modalSet,
      }),
    );

    act(() => result.current.handleActivateTextSelection());
    expect(result.current.isTextSelectionActive).toBe(true);
    expect(modalSet).toHaveBeenCalledWith(false);

    act(() => jest.advanceTimersByTime(550));
    expect(result.current.qlRect?.width).toBe(100);
    expect(lockSpy).toHaveBeenCalled();
  });

  it('cancel resets state, opens modal and clears selection', () => {
    const modalSet = jest.fn();

    const { result } = renderHook(() =>
      useTextSelectionOverlay({
        selectedTool: toolFree,
        targetLanguage: '',
        setSnackbar: jest.fn(),
        setModalOpen: modalSet,
      }),
    );

    act(() => result.current.handleActivateTextSelection());
    expect(result.current.isTextSelectionActive).toBe(true);

    act(() => result.current.handleCancelTextSelection());

    expect(result.current.isTextSelectionActive).toBe(false);
    expect(result.current.selectedText).toBe('');
    expect(modalSet).toHaveBeenCalledWith(true);
  });

  it('tracks selected text via selectionchange event', () => {
    const modalSet = jest.fn();

    const { result } = renderHook(() =>
      useTextSelectionOverlay({
        selectedTool: toolFree,
        targetLanguage: '',
        setSnackbar: jest.fn(),
        setModalOpen: modalSet,
      }),
    );

    act(() => result.current.handleActivateTextSelection());

    const selSpy = jest.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'Hello',
      removeAllRanges: () => {},
    } as any);

    act(() => {
      document.dispatchEvent(new Event('selectionchange'));
    });

    expect(result.current.selectedText).toBe('Hello');
    selSpy.mockRestore();
  });
});
