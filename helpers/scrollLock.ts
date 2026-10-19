let locks = 0;
let previousOverflow = '';
let previousOverflowY = '';

export const unlockBodyScroll = () => {
  if (!locks) return;

  locks -= 1;

  if (!locks) {
    document.body.style.overflow = previousOverflow;
    document.body.style.overflowY = previousOverflowY;
  }
};

export const lockBodyScroll = () => {
  if (!locks) {
    previousOverflow = document.body.style.overflow;
    previousOverflowY = document.body.style.overflowY;
    document.body.style.overflow = 'hidden';
  }

  locks += 1;

  let isReleased = false;

  return () => {
    if (!isReleased) {
      isReleased = true;
      unlockBodyScroll();
    }
  };
};
