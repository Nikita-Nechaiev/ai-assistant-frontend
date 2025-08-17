import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { IDocument, IVersion } from '@/models/models';

import VersionItem from '../VersionItem';

const mkVersion = (id = 1): IVersion => ({
  id,
  userEmail: `user${id}@mail.com`,
  createdAt: new Date('2025-07-10T00:00:00Z'),
  richContent: 'content',
  document: { id: 1 } as IDocument,
});

describe('VersionItem', () => {
  it('renders email & formatted date; default style', () => {
    const version = mkVersion();

    render(
      <VersionItem
        version={version}
        isSelected={false}
        isCurrent={false}
        onClick={jest.fn()}
        onMouseEnter={jest.fn()}
        onMouseLeave={jest.fn()}
      />,
    );

    expect(screen.getByText(`Changed by: ${version.userEmail}`)).toBeInTheDocument();

    const formatted = new Date(version.createdAt).toLocaleDateString();

    expect(screen.getByText(`At: ${formatted}`)).toBeInTheDocument();

    const card = screen.getByText(/changed by/i).parentElement as HTMLElement;

    expect(card).toHaveClass('border-mainLightGray');
    expect(card).not.toHaveClass('bg-mainLightGray');
  });

  it('applies “selected” style when isSelected or isCurrent', () => {
    const version = mkVersion(2);

    const { rerender } = render(
      <VersionItem
        version={version}
        isSelected={true}
        isCurrent={false}
        onClick={jest.fn()}
        onMouseEnter={jest.fn()}
        onMouseLeave={jest.fn()}
      />,
    );

    let card = screen.getByText(/changed by/i).parentElement as HTMLElement;

    expect(card).toHaveClass('bg-mainLightGray', 'border-mainDarkHover');

    rerender(
      <VersionItem
        version={version}
        isSelected={false}
        isCurrent={true}
        onClick={jest.fn()}
        onMouseEnter={jest.fn()}
        onMouseLeave={jest.fn()}
      />,
    );

    card = screen.getByText(/changed by/i).parentElement as HTMLElement;
    expect(card).toHaveClass('bg-mainLightGray', 'border-mainDarkHover');
  });

  it('fires onClick / mouse enter-leave callbacks with correct args', () => {
    const version = mkVersion(3);
    const onClick = jest.fn();
    const onEnter = jest.fn();
    const onLeave = jest.fn();

    render(
      <VersionItem
        version={version}
        isSelected={false}
        isCurrent={false}
        onClick={onClick}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      />,
    );

    const card = screen.getByText(/changed by/i).parentElement as HTMLElement;

    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledWith(version);

    fireEvent.mouseEnter(card);
    expect(onEnter).toHaveBeenCalledWith(version);

    fireEvent.mouseLeave(card);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});
