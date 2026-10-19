import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { SnackbarStatusEnum } from '@/models/enums';
import { AITool } from '@/models/models';

import AiAsssistanceStepper, { AiAsssistanceStepperProps } from '../AiAssistanceStepper';

jest.mock('@/components/AiAssistance/Step1SelectTool', () => ({
  __esModule: true,
  default: ({ onToolSelect }: any) => (
    <button onClick={() => onToolSelect({ id: 't', name: 'MockTool' })}>mock-select-tool</button>
  ),
}));

jest.mock('@/components/AiAssistance/Step2Input', () => ({
  __esModule: true,
  default: (props: any) => (
    <div>
      <button onClick={() => props.onSubmit()}>mock-submit</button>
      <button onClick={() => props.onGoBack()}>mock-back</button>
    </div>
  ),
}));

jest.mock('@/components/AiAssistance/Step3Success', () => ({
  __esModule: true,
  default: ({ onCopyResult, onRestart }: any) => (
    <div>
      <button onClick={onCopyResult}>mock-copy</button>
      <button onClick={onRestart}>mock-restart</button>
    </div>
  ),
}));

const setSnackbarMock = jest.fn();

jest.mock('@/store/useSnackbarStore', () => () => ({
  setSnackbar: setSnackbarMock,
}));

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

const baseProps = (): Omit<AiAsssistanceStepperProps, 'children'> => ({
  isOnDocumentPage: false,
  onSubmit: jest.fn(),
  onRestart: jest.fn(),
  isLoading: false,
  result: 'RESULT',
  flow: {
    currentStep: 1,
    setCurrentStep: jest.fn(),
    selectedTool: null,
    selectTool: jest.fn(),
    inputValue: '',
    setInputValue: jest.fn(),
    targetLanguage: '',
    setTargetLanguage: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
  },
});

const setup = (override?: Partial<ReturnType<typeof baseProps>['flow']>) => {
  const base = baseProps();
  const props = { ...base, flow: { ...base.flow, ...override } };

  return {
    ...props,
    render: () => render(<AiAsssistanceStepper {...props} />),
  };
};

describe('AiAssistanceStepper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Step 1 and advances to Step 2 on tool select', () => {
    const ctx = setup();

    ctx.render();

    const btn = screen.getByText('mock-select-tool');

    fireEvent.click(btn);

    expect(ctx.flow.selectTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'MockTool' }));
  });

  it('renders Step 2 and calls onSubmit', () => {
    const ctx = setup({
      currentStep: 2,
      selectedTool: { id: 't', name: 'MockTool' } as AITool,
    });

    ctx.render();

    fireEvent.click(screen.getByText('mock-submit'));
    expect(ctx.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('goes back from Step 2 to Step 1 when onGoBack triggered', () => {
    const ctx = setup({
      currentStep: 2,
      selectedTool: { id: 't', name: 'MockTool' } as AITool,
    });

    ctx.render();

    fireEvent.click(screen.getByText('mock-back'));
    expect(ctx.flow.goBack).toHaveBeenCalled();
  });

  it('copies result and shows snackbar on Step 3 copy', async () => {
    const ctx = setup({ currentStep: 3 });

    ctx.render();

    fireEvent.click(screen.getByText('mock-copy'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('RESULT');
    await waitFor(() =>
      expect(setSnackbarMock).toHaveBeenCalledWith('Result copied to clipboard', SnackbarStatusEnum.SUCCESS),
    );
  });

  it('restarts flow from Step 3', () => {
    const ctx = setup({ currentStep: 3 });

    ctx.render();

    fireEvent.click(screen.getByText('mock-restart'));

    expect(ctx.onRestart).toHaveBeenCalled();
  });
});
