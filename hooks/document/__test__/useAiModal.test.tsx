// hooks/document/__test__/useAiModal.test.tsx
import { renderHook, act } from '@testing-library/react';

import type { AITool } from '@/models/models';

import useAiModal from '../useAiModal';

/* ─────────── Correct way: define spies inside mock and export ─────────── */
const lockSpy = jest.fn();
const unlockSpy = jest.fn();

jest.mock('@/helpers/scrollLock', () => ({
  lockBodyScroll: (...args: any[]) => lockSpy(...args),
  unlockBodyScroll: (...args: any[]) => unlockSpy(...args),
}));

const mockTool = { id: 't1', name: 'GPT-Rewrite' } as AITool;

describe('useAiModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens modal, resets step & usage, locks body scroll', () => {
    const usageSpy = jest.fn();
    const { result } = renderHook(() => useAiModal({ setNewAiUsage: usageSpy }));

    act(() => result.current.open());

    expect(result.current.isAiModalOpen).toBe(true);
    expect(result.current.currentStep).toBe(1);
    expect(usageSpy).toHaveBeenCalledWith(null);
    expect(lockSpy).toHaveBeenCalled();
  });

  it('nextStep increments currentStep', () => {
    const { result } = renderHook(() => useAiModal({}));

    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(2);
  });

  it('selectTool sets selectedTool', () => {
    const { result } = renderHook(() => useAiModal({}));

    act(() => result.current.selectTool(mockTool));
    expect(result.current.selectedTool).toBe(mockTool);
  });

  it('reset returns to step 1 and clears usage', () => {
    const usageSpy = jest.fn();
    const { result } = renderHook(() => useAiModal({ setNewAiUsage: usageSpy }));

    act(() => {
      result.current.nextStep();
      result.current.reset();
    });

    expect(result.current.currentStep).toBe(1);
    expect(usageSpy).toHaveBeenLastCalledWith(null);
  });

  it('setTargetLanguage updates targetLanguage', () => {
    const { result } = renderHook(() => useAiModal({}));

    act(() => result.current.setTargetLanguage('fr'));
    expect(result.current.targetLanguage).toBe('fr');
  });

  it('close hides modal, clears usage, unlocks body scroll', () => {
    const usageSpy = jest.fn();
    const { result } = renderHook(() => useAiModal({ setNewAiUsage: usageSpy }));

    act(() => result.current.open());
    act(() => result.current.close());

    expect(result.current.isAiModalOpen).toBe(false);
    expect(usageSpy).toHaveBeenLastCalledWith(null);
    expect(unlockSpy).toHaveBeenCalled();
  });
});
