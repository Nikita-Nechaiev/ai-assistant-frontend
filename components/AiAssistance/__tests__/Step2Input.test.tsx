import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { AITool } from '@/models/models';

import Step2Input from '../Step2Input';

const mkTool = (opts?: Partial<AITool>): AITool => ({
  id: 't1',
  name: 'Translator',
  endpoint: '',
  bodyField: '',
  requiresTargetLanguage: false,
  Icon: undefined,
  ...opts,
});

const baseHandlers = () => ({
  onInputChange: jest.fn(),
  onTargetLanguageChange: jest.fn(),
  onSubmit: jest.fn(),
  onGoBack: jest.fn(),
  handleActivateTextSelection: jest.fn(),
});

describe('Step2Input', () => {
  it('renders textarea and passes text to onInputChange', () => {
    const handlers = baseHandlers();

    render(
      <Step2Input
        selectedTool={mkTool()}
        inputValue=''
        targetLanguage=''
        isLoading={false}
        isOnDocumentPage={false}
        {...handlers}
      />,
    );

    const textarea = screen.getByPlaceholderText(/enter your text/i);

    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(handlers.onInputChange).toHaveBeenCalledWith('Hello');
  });

  it('shows target-language input only when tool.requiresTargetLanguage', () => {
    const handlers = baseHandlers();

    const { rerender } = render(
      <Step2Input
        selectedTool={mkTool({ requiresTargetLanguage: false })}
        inputValue=''
        targetLanguage=''
        isLoading={false}
        isOnDocumentPage={false}
        {...handlers}
      />,
    );

    expect(screen.queryByPlaceholderText(/enter target language/i)).toBeNull();

    rerender(
      <Step2Input
        selectedTool={mkTool({ requiresTargetLanguage: true })}
        inputValue=''
        targetLanguage=''
        isLoading={false}
        isOnDocumentPage={false}
        {...handlers}
      />,
    );
    expect(screen.getByPlaceholderText(/enter target language/i)).toBeInTheDocument();
  });

  it('calls onTargetLanguageChange when language input changes', () => {
    const handlers = baseHandlers();

    render(
      <Step2Input
        selectedTool={mkTool({ requiresTargetLanguage: true })}
        inputValue=''
        targetLanguage=''
        isLoading={false}
        isOnDocumentPage={false}
        {...handlers}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/enter target language/i), {
      target: { value: 'French' },
    });
    expect(handlers.onTargetLanguageChange).toHaveBeenCalledWith('French');
  });

  it('shows “Select from the document” button only on document page', () => {
    const handlers = baseHandlers();

    const { rerender } = render(
      <Step2Input
        selectedTool={mkTool()}
        inputValue=''
        targetLanguage=''
        isLoading={false}
        isOnDocumentPage={false}
        {...handlers}
      />,
    );

    expect(screen.queryByText(/select from the document/i)).toBeNull();

    rerender(
      <Step2Input
        selectedTool={mkTool()}
        inputValue=''
        targetLanguage=''
        isLoading={false}
        isOnDocumentPage={true}
        {...handlers}
      />,
    );

    const btn = screen.getByText(/select from the document/i);

    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handlers.handleActivateTextSelection).toHaveBeenCalled();
  });

  it('handles submit and go-back buttons, shows loading text', () => {
    const handlers = baseHandlers();

    const { rerender } = render(
      <Step2Input
        selectedTool={mkTool()}
        inputValue=''
        targetLanguage=''
        isLoading={false}
        isOnDocumentPage={false}
        {...handlers}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go Back' }));
    expect(handlers.onGoBack).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(handlers.onSubmit).toHaveBeenCalled();

    rerender(
      <Step2Input
        selectedTool={mkTool()}
        inputValue=''
        targetLanguage=''
        isLoading={true}
        isOnDocumentPage={false}
        {...handlers}
      />,
    );
    expect(screen.getByText(/processing the request/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
  });
});
