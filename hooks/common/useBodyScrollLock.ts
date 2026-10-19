import { useLayoutEffect } from 'react';

import { lockBodyScroll } from '@/helpers/scrollLock';

export default function useBodyScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (active) return lockBodyScroll();
  }, [active]);
}
