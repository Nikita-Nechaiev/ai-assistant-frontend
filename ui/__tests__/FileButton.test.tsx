import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import FileButton from '../FileButton';

global.URL.createObjectURL = jest.fn(() => 'mock-preview-url');

describe('FileButton', () => {
  const onChangeMock = jest.fn();

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  it('renders label and input', () => {
    render(<FileButton id='test-file' label='Upload' onChange={onChangeMock} />);

    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('No file selected')).toBeInTheDocument();
  });

  it('calls onChange when file is selected', () => {
    render(<FileButton id='test-file' label='Upload' onChange={onChangeMock} />);

    const input = screen.getByLabelText('Upload') as HTMLInputElement;
    const file = new File(['hello'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('shows image preview when image file is selected', () => {
    render(<FileButton id='test-file' label='Upload' onChange={onChangeMock} />);

    const input = screen.getByLabelText('Upload') as HTMLInputElement;
    const file = new File(['dummy'], 'test-image.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByAltText('Selected file')).toBeInTheDocument();
  });

  it('does not show preview if non-image file is selected', () => {
    render(<FileButton id='test-file' label='Upload' onChange={onChangeMock} />);

    const input = screen.getByLabelText('Upload') as HTMLInputElement;
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.queryByAltText('Selected file')).not.toBeInTheDocument();
    expect(screen.getByText('No file selected')).toBeInTheDocument();
  });
});
