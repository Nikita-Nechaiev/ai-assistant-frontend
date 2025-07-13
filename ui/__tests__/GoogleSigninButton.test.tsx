import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import GoogleSigninButton from '../GoogleSigninButton';

describe('GoogleSigninButton', () => {
  it('renders button with Google icon and text', () => {
    render(<GoogleSigninButton onClick={jest.fn()} />);

    const button = screen.getByRole('button', { name: /continue with google/i });

    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const onClickMock = jest.fn();

    render(<GoogleSigninButton onClick={onClickMock} />);

    const button = screen.getByRole('button', { name: /continue with google/i });

    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
