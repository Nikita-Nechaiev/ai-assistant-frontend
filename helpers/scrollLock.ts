export const lockBodyScroll = () => {
  document.body.style.overflow = 'hidden';
};

export const unlockBodyScroll = () => {
  document.body.style.overflowY = 'auto';
};
