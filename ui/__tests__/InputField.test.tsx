import React from 'react';

import { render, screen } from '@testing-library/react';
import { FieldError } from 'react-hook-form';

import InputField from '../InputField';

describe('InputField', () => {
  it('renders label and input with provided id', () => {
    render(<InputField id='email' label='Email' />);

    const label = screen.getByLabelText('Email');

    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('id', 'email');
  });

  it('applies error class when error is passed', () => {
    render(<InputField id='username' label='Username' error='Required field' />);

    const input = screen.getByLabelText('Username');

    expect(input).toHaveClass('border-red-500');
  });

  it('renders string error message', () => {
    render(<InputField id='name' label='Name' error='Name is required' />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('renders FieldError object message', () => {
    const fieldError: FieldError = {
      type: 'required',
      message: 'This field is required',
    };

    render(<InputField id='password' label='Password' error={fieldError} />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('supports additional props like type and placeholder', () => {
    render(<InputField id='phone' label='Phone' type='tel' placeholder='Enter phone' />);

    const input = screen.getByPlaceholderText('Enter phone');

    expect(input).toHaveAttribute('type', 'tel');
  });
});
