import React from 'react';

import { render } from '@testing-library/react';

import LargeLoader from '../LargeLoader';
import styles from '../styles/LargeLoader.module.css';

describe('LargeLoader', () => {
  it('renders wrapper, screen and loader elements with correct classes', () => {
    const { container } = render(<LargeLoader />);

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass(styles.wrapper);

    const screenDiv = wrapper.querySelector(`.${styles.screen}`) as HTMLElement;

    expect(screenDiv).toBeInTheDocument();

    const loaderDiv = screenDiv.querySelector(`.${styles.loader}`) as HTMLElement;

    expect(loaderDiv).toBeInTheDocument();
  });
});
