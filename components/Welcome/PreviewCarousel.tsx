'use client';

import { KeyboardEvent, useEffect, useRef, useState } from 'react';

import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ProductPreview } from './scenes/ProductPreview';
import { WelcomeSlide, welcomeSlides } from './welcomeSlides';
import styles from './welcomeStyles';

function SlideImage({ slide }: { slide: WelcomeSlide }) {
  const [hasFailed, setHasFailed] = useState(false);

  return slide.src && !hasFailed ? (
    <img
      src={slide.src}
      alt={slide.alt}
      width={1600}
      height={1000}
      loading='lazy'
      className={styles.screenshot}
      onError={() => setHasFailed(true)}
    />
  ) : (
    <div role='img' aria-label={slide.alt}>
      <ProductPreview kind={slide.id} />
    </div>
  );
}

export default function PreviewCarousel() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;

    if (!track || !slide) return;

    track.scrollTo({
      left: slide.offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };
  const syncPosition = () => {
    if (frameRef.current) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;

      const track = trackRef.current;

      if (!track) return;

      const slides = Array.from(track.children) as HTMLElement[];
      const nearest = slides.reduce(
        (best, slide, index) =>
          Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(slides[best].offsetLeft - track.scrollLeft)
            ? index
            : best,
        0,
      );

      setActive(nearest);
    });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();

      goTo(Math.max(0, Math.min(welcomeSlides.length - 1, active + (event.key === 'ArrowRight' ? 1 : -1))));
    }
  };

  return (
    <div
      role='region'
      aria-roledescription='carousel'
      aria-label='Application previews'
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={styles.carousel}
    >
      <div className={styles.carouselControls}>
        <div className={styles.carouselDots} aria-label='Choose a preview'>
          {welcomeSlides.map((slide, index) => (
            <button
              key={slide.id}
              type='button'
              onClick={() => goTo(index)}
              aria-label={`Show ${slide.id === 'ai' ? 'AI Assistance' : slide.id === 'editor' ? 'Document editor' : slide.id === 'versions' ? 'Version history' : slide.id === 'chat' ? 'Session chat' : 'Dashboard'} preview`}
              aria-current={active === index ? 'true' : undefined}
              className={cn(styles.carouselDot, active === index && styles.carouselDotActive)}
            />
          ))}
        </div>
        <div className={styles.carouselArrows}>
          <span className={styles.slideCount} aria-live='polite' aria-atomic='true'>
            {active + 1} / {welcomeSlides.length}
          </span>
          <Button
            type='button'
            variant='outline'
            size='icon'
            aria-label='Previous preview'
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
            className='h-11 w-11 rounded-full shadow-none'
          >
            <FiArrowLeft aria-hidden='true' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            aria-label='Next preview'
            disabled={active === welcomeSlides.length - 1}
            onClick={() => goTo(active + 1)}
            className='h-11 w-11 rounded-full shadow-none'
          >
            <FiArrowRight aria-hidden='true' />
          </Button>
        </div>
      </div>
      <div ref={trackRef} onScroll={syncPosition} className={styles.carouselTrack}>
        {welcomeSlides.map((slide, index) => (
          <div
            key={slide.id}
            role='group'
            aria-roledescription='slide'
            aria-label={`${index + 1} of ${welcomeSlides.length}: ${slide.title}`}
            aria-hidden={index !== active}
            className={styles.carouselSlide}
          >
            <SlideImage key={slide.src || slide.id} slide={slide} />
          </div>
        ))}
      </div>
    </div>
  );
}
