import { renderHook, act, waitFor } from '@testing-library/react';

import { SnackbarStatusEnum } from '@/models/enums';
import type { IAiToolUsage } from '@/models/models';

import useDocumentAI from '../useDocumentAI';

/* ─────────── Store mocks ─────────── */
jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({ user: { id: 1 } }),
}));

const setSnackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({
  __esModule: true,
  default: () => ({ setSnackbar: setSnackbarMock }),
}));

/* ─────────── Child-hook mocks ─────────── */
const overlayMock = {
  isTextSelectionActive: false,
  qlRect: null,
  selectedText: '',
  handleCancelTextSelection: jest.fn(),
  handleActivateTextSelection: jest.fn(),
};

jest.mock('../useTextSelectionOverlay', () => ({
  __esModule: true,
  default: () => overlayMock,
}));

const aiModalMock = {
  isAiModalOpen: false,
  open: jest.fn(),
  close: jest.fn(),
  currentStep: 1,
  setCurrentStep: jest.fn(),
  nextStep: jest.fn(),
  reset: jest.fn(),
  selectedTool: null as any,
  selectTool: jest.fn(),
  targetLanguage: '',
  setTargetLanguage: jest.fn(),
  setIsOpen: jest.fn(),
};

jest.mock('../useAiModal', () => ({
  __esModule: true,
  default: () => aiModalMock,
}));

/* ─────────── helpers ─────────── */
const makeUsage = (userId: number): IAiToolUsage => ({
  id: 1,
  toolName: 'rewrite',
  sentText: 'x',
  result: 'y',
  user: { id: userId } as any,
  timestamp: new Date('2024-03-15T12:00:00Z'),
});

describe('useDocumentAI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // reset mutable mocks
    overlayMock.selectedText = '';
    aiModalMock.selectedTool = null;
    aiModalMock.targetLanguage = '';
  });

  it('opens AI modal when new usage belongs to current user', async () => {
    renderHook(() =>
      useDocumentAI({
        documentId: 1,
        newAiUsage: makeUsage(1), // same user id
        isFetchingAI: false,
      }),
    );

    await waitFor(() => {
      expect(overlayMock.handleCancelTextSelection).toHaveBeenCalled();
      expect(aiModalMock.setIsOpen).toHaveBeenCalledWith(true);
      expect(aiModalMock.setCurrentStep).toHaveBeenCalledWith(3);
    });
  });

  it('handleCreateUsage validates empty input', () => {
    const { result } = renderHook(() =>
      useDocumentAI({
        documentId: 1,
        newAiUsage: null,
        isFetchingAI: false,
      }),
    );

    act(() => result.current.ai.handleCreateUsage(''));
    expect(setSnackbarMock).toHaveBeenCalledWith('Input cannot be empty', SnackbarStatusEnum.ERROR);
  });

  it('handleCreateUsage validates missing target language', () => {
    overlayMock.selectedText = 'hello';
    aiModalMock.selectedTool = { endpoint: 'translate', requiresTargetLanguage: true };

    const { result } = renderHook(() =>
      useDocumentAI({
        documentId: 7,
        newAiUsage: null,
        isFetchingAI: false,
      }),
    );

    act(() => result.current.ai.handleCreateUsage());
    expect(setSnackbarMock).toHaveBeenCalledWith('Please specify a target language', SnackbarStatusEnum.ERROR);
  });

  it('handleCreateUsage calls createDocumentAiUsage with correct payload', () => {
    const fn = jest.fn();

    overlayMock.selectedText = 'hello';
    aiModalMock.selectedTool = { endpoint: 'rewrite', requiresTargetLanguage: false };

    const { result } = renderHook(() =>
      useDocumentAI({
        documentId: 5,
        createDocumentAiUsage: fn,
        newAiUsage: null,
        isFetchingAI: false,
      }),
    );

    act(() => result.current.ai.handleCreateUsage());
    expect(fn).toHaveBeenCalledWith({
      toolName: 'rewrite',
      text: 'hello',
      documentId: 5,
      targetLanguage: '',
    });
  });
});
