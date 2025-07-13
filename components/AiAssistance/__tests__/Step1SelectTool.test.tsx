import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { aiToolList } from '@/helpers/aiToolsList';

import Step1SelectTool from '../Step1SelectTool';

/* ------------------------------------------------------------------ */
/*                     Mock next/navigation router                     */
/* ------------------------------------------------------------------ */
const backMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: backMock }),
}));

describe('Step1SelectTool', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Go Back" button and calls router.back()', () => {
    render(<Step1SelectTool onToolSelect={jest.fn()} isOnDocumentPage={false} />);

    const goBackBtn = screen.getByText(/go back/i);

    expect(goBackBtn).toBeInTheDocument();

    fireEvent.click(goBackBtn);
    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it('hides "Go Back" button when on document page', () => {
    render(<Step1SelectTool onToolSelect={jest.fn()} isOnDocumentPage={true} />);
    expect(screen.queryByText(/go back/i)).toBeNull();
  });

  it('renders all AI-tool buttons and passes tool to onToolSelect', () => {
    const selectMock = jest.fn();

    render(<Step1SelectTool onToolSelect={selectMock} isOnDocumentPage={false} />);

    // рендерится столько кнопок, сколько элементов в aiToolList
    const buttons = screen.getAllByRole('button').filter((b) => b.textContent && !/Go Back/i.test(b.textContent));

    expect(buttons.length).toBe(aiToolList.length);

    // кликаем по первой
    fireEvent.click(buttons[0]);
    expect(selectMock).toHaveBeenCalledWith(aiToolList[0]);
  });
});
