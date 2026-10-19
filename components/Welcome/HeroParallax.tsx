'use client';

import { ReactNode, useEffect, useRef } from 'react';

import styles from './welcomeStyles';

export default function HeroParallax({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const section = root.closest('section');
    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isVisible = false;
    let frame = 0;

    const paint = () => {
      frame = 0;

      const rect = section?.getBoundingClientRect();
      const progress = reducedMotion.matches || !rect ? 0 : Math.min(1, Math.max(0, -rect.top / rect.height));

      layers.forEach((layer) => {
        const distance = Number(layer.dataset.parallax) || 0;

        layer.style.setProperty('--parallax-offset', `${(progress * distance).toFixed(2)}px`);
      });
    };
    const schedule = () => {
      if (!frame && isVisible && !reducedMotion.matches) frame = window.requestAnimationFrame(paint);
    };
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;

      if (isVisible) schedule();
      else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    });

    observer.observe(root);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', paint);
    paint();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', paint);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.heroVisual}>
      <div className={styles.heroGlow} data-parallax='40' aria-hidden='true' />
      {children}
    </div>
  );
}
