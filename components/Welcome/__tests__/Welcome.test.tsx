import React from 'react';

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

import { PublicInfoApi } from '@/services/PublicInfoApi';

import WelcomePage from '../WelcomePage';
import PreviewCarousel from '../PreviewCarousel';
import HeroParallax from '../HeroParallax';
import ResumeDownloadButton from '../ResumeDownloadButton';
import { ProductPreview } from '../scenes/ProductPreview';
import { FeatureIllustration } from '../scenes/FeatureIllustration';

jest.mock('@/services/PublicInfoApi');
jest.mock('../welcomeStyles', () => ({ __esModule: true, default: new Proxy({}, { get: (_, key) => key }) }));

const snackbar = jest.fn();

jest.mock('@/store/useSnackbarStore', () => ({ __esModule: true, default: () => ({ setSnackbar: snackbar }) }));

let observers: ((entries: any[]) => void)[] = [];
const media = { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  observers = [];
  window.matchMedia = jest.fn().mockReturnValue(media);
  media.matches = false;
  global.IntersectionObserver = class {
    constructor(cb: any) {
      observers.push(cb);
    }

    observe() {}

    disconnect() {}

    unobserve() {}
  } as any;
  Element.prototype.scrollTo = jest.fn();
});
it.each([false, true])('renders welcome navigation for authenticated=%s', (authenticated) => {
  render(<WelcomePage isAuthenticated={authenticated} />);
  expect(
    screen.getAllByRole('link', { name: authenticated ? 'Go to dashboard' : 'Create an account' })[0],
  ).toHaveAttribute('href', authenticated ? '/dashboard' : '/registration');
  expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
});
it('renders all product scenes, including the preview image fallback', () => {
  for (const kind of ['dashboard', 'editor', 'ai', 'versions', 'chat']) {
    const { unmount } = render(<ProductPreview kind={kind as any} />);

    expect(document.querySelector('svg')).not.toBeNull();
    unmount();
  }

  for (const kind of ['write', 'ai', 'team']) {
    const { unmount } = render(<FeatureIllustration kind={kind as any} />);

    expect(document.querySelector('svg')).not.toBeNull();
    unmount();
  }

  render(<PreviewCarousel />);

  for (const image of screen.getAllByRole('img', { hidden: true })) if (image.tagName === 'IMG') fireEvent.error(image);

  expect(screen.getByRole('region', { name: 'Application previews' })).toBeInTheDocument();
});
it('moves previews by buttons/keyboard and synchronizes the active slide from scrolling', () => {
  jest.useFakeTimers();

  const { container } = render(<PreviewCarousel />);
  const carousel = screen.getByRole('region');
  const track = container.querySelector('.carouselTrack') as HTMLElement;

  Array.from(track.children).forEach((slide, index) =>
    Object.defineProperty(slide, 'offsetLeft', { value: index * 100 }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Next preview' }));
  expect(track.scrollTo).toHaveBeenCalledWith({ left: 100, behavior: 'smooth' });
  fireEvent.keyDown(carousel, { key: 'ArrowRight' });
  fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
  fireEvent.keyDown(carousel, { key: 'ArrowRight', altKey: true });
  fireEvent.keyDown(carousel, { key: 'Enter' });
  fireEvent.click(screen.getByRole('button', { name: 'Show AI Assistance preview' }));
  track.scrollLeft = 100;
  fireEvent.scroll(track);
  fireEvent.scroll(track);
  act(() => jest.advanceTimersByTime(20));
  expect(screen.getByRole('button', { name: 'Show AI Assistance preview' })).toHaveAttribute('aria-current', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Previous preview' }));
  expect(track.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' });
  media.matches = true;
  fireEvent.click(screen.getByRole('button', { name: 'Next preview' }));
  expect(track.scrollTo).toHaveBeenLastCalledWith({ left: 200, behavior: 'instant' });
  jest.restoreAllMocks();
  jest.useRealTimers();
});
it('updates parallax only while visible and respects reduced motion', () => {
  jest.useFakeTimers();

  const { container, unmount } = render(
    <section>
      <HeroParallax>
        <div data-parallax='20'>Layer</div>
        <div data-parallax='bad'>Static</div>
      </HeroParallax>
    </section>,
  );
  const section = container.querySelector('section')!;

  section.getBoundingClientRect = () => ({ top: -50, height: 100 }) as DOMRect;
  act(() => observers[0]([{ isIntersecting: true }]));
  fireEvent.scroll(window);
  act(() => jest.advanceTimersByTime(20));
  expect(screen.getByText('Layer').style.getPropertyValue('--parallax-offset')).toBe('10.00px');
  fireEvent.resize(window);
  act(() => observers[0]([{ isIntersecting: false }]));
  media.matches = true;
  act(() => {
    const listener = media.addEventListener.mock.calls[0][1];

    listener();
  });
  expect(screen.getByText('Layer').style.getPropertyValue('--parallax-offset')).toBe('0.00px');
  fireEvent.scroll(window);
  unmount();
  expect(media.removeEventListener).toHaveBeenCalled();
  jest.restoreAllMocks();
  jest.useRealTimers();
});
it('downloads the resume and releases its temporary URL', async () => {
  jest.useFakeTimers();
  URL.createObjectURL = jest.fn(() => 'blob:resume');

  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  (PublicInfoApi.fetchCv as jest.Mock).mockResolvedValue(new Blob(['%PDF']));
  render(<ResumeDownloadButton />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toBeDisabled();
  await act(async () => {});
  expect(click).toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Resume' })).toBeEnabled();
  act(() => jest.advanceTimersByTime(1000));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:resume');
  click.mockRestore();
  jest.useRealTimers();
});
it('reports download failures and permits retrying', async () => {
  (PublicInfoApi.fetchCv as jest.Mock).mockRejectedValue(Error('offline'));
  render(<ResumeDownloadButton />);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(snackbar).toHaveBeenCalledWith(expect.stringContaining('Could not download'), 'error'));
  expect(screen.getByRole('button')).toBeEnabled();
});
