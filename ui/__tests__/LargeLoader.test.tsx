import React from 'react';

import { render } from '@testing-library/react';

import LargeLoader from '../LargeLoader';
import styles from '../styles/LargeLoader.module.css';

describe('LargeLoader', () => {
  it('renders wrapper, screen and loader elements with correct classes', () => {
    const { container } = render(<LargeLoader />);

    // корневой элемент
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass(styles.wrapper);

    // вложенный элемент с классом screen
    const screenDiv = wrapper.querySelector(`.${styles.screen}`) as HTMLElement;

    expect(screenDiv).toBeInTheDocument();

    // внутри него элемент loader
    const loaderDiv = screenDiv.querySelector(`.${styles.loader}`) as HTMLElement;

    expect(loaderDiv).toBeInTheDocument();
  });
});
