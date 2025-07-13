import { render, screen } from '@testing-library/react';

import SubmitButton from '../SubmitButton'; // поправь путь, если структура иная

describe('SubmitButton', () => {
  it('renders label when not loading', () => {
    render(<SubmitButton isLoading={false} label='Send' />);

    // ожидаем текст кнопки
    const button = screen.getByRole('button', { name: /send/i });

    expect(button).toBeInTheDocument();
  });

  it('shows "Loading..." when isLoading=true', () => {
    render(<SubmitButton isLoading={true} label='Send' />);

    // теперь должен появиться «Loading…»
    const button = screen.getByRole('button', { name: /loading/i });

    expect(button).toBeInTheDocument();
  });
});
