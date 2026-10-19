import React from 'react';

import { render, renderHook, fireEvent, screen, act } from '@testing-library/react';

import { lockBodyScroll } from '@/helpers/scrollLock';
import useAvatarPreview from '@/hooks/profile/useAvatarPreview';
import useAiModal from '@/hooks/document/useAiModal';
import WorkspaceModal from '@/components/common/WorkspaceModal';

function ModalScenario() {
  const modal = useAiModal({});

  return (
    <>
      <button onClick={modal.open}>Open</button>
      <WorkspaceModal isOpen={modal.isAiModalOpen} onClose={modal.close} onCancel={modal.close} title='AI dialog' />
    </>
  );
}
it('keeps nested locks until their owner releases them and restores the original inline styles', () => {
  document.body.style.overflow = 'scroll';
  document.body.style.overflowY = 'auto';

  const first = lockBodyScroll(),
    second = lockBodyScroll();

  first();
  first();
  expect(document.body.style.overflow).toBe('hidden');
  second();
  expect(document.body.style.overflow).toBe('scroll');
  expect(document.body.style.overflowY).toBe('auto');
  document.body.style.overflow = '';
  document.body.style.overflowY = '';
});
it('restores body styles after an actual dialog closes or its scenario unmounts', () => {
  document.body.style.overflow = 'scroll';
  document.body.style.overflowY = 'auto';

  const { unmount } = render(<ModalScenario />);

  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(document.body.style.overflow).toBe('scroll');
  expect(document.body.style.overflowY).toBe('auto');
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  unmount();
  expect(document.body.style.overflow).toBe('scroll');
  expect(document.body.style.overflowY).toBe('auto');
  document.body.style.overflow = '';
  document.body.style.overflowY = '';
});
it('releases avatar blob URLs on replacement, closing and unmount without revoking remote avatars', () => {
  const revoke = jest.mocked(URL.revokeObjectURL);

  revoke.mockClear();
  URL.createObjectURL = jest
    .fn()
    .mockReturnValueOnce('blob:first')
    .mockReturnValueOnce('blob:second')
    .mockReturnValueOnce('blob:third');

  const file = new File(['avatar'], 'avatar.png');
  const { result, rerender, unmount } = renderHook(({ open }) => useAvatarPreview('/avatar.png', open), {
    initialProps: { open: true },
  });

  act(() => result.current.onChange({ target: { files: [file] } } as any));
  expect(result.current.preview).toBe('blob:first');
  act(() => result.current.onChange({ target: { files: [file] } } as any));
  expect(revoke).toHaveBeenCalledWith('blob:first');
  rerender({ open: false });
  expect(revoke).toHaveBeenCalledWith('blob:second');
  expect(result.current.file).toBeNull();
  expect(result.current.preview).toBe('/avatar.png');
  rerender({ open: true });
  act(() => result.current.onChange({ target: { files: [file] } } as any));
  unmount();
  expect(revoke.mock.calls.map(([url]) => url)).toEqual(['blob:first', 'blob:second', 'blob:third']);
});
