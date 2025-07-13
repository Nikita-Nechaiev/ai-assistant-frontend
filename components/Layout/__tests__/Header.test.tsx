import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { IInvitation } from '@/models/models';
import { NotificationStatusEnum } from '@/models/enums';

import Header from '../Header';

/* ------------------------------------------------------------------ */
/*                     1 — Mocks для вложенных зависимостей            */
/* ------------------------------------------------------------------ */
// Zustand-store текущего пользователя
jest.mock('@/store/useUserStore', () => ({
  useUserStore: () => ({
    user: { id: 1, name: 'Alice', email: 'alice@mail.com', avatar: 'alice.png' },
  }),
}));

// Аватар — рисуем простой span, чтобы видеть проп
jest.mock('../../common/UserAvatarCircle', () => ({
  __esModule: true,
  default: ({ avatar }: { avatar: string }) => <span data-testid='avatar'>{avatar}</span>,
}));

// Модалка профиля — отслеживаем флаг isOpen
const modalSpy = jest.fn();

jest.mock('../ProfileModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => {
    modalSpy(isOpen);

    return isOpen ? <div data-testid='modal'>modal</div> : null;
  },
}));

/* ------------------------------------------------------------------ */
/*                        2 — Хелп для инвайтов                        */
/* ------------------------------------------------------------------ */
const dummyInvitation = (status: NotificationStatusEnum = NotificationStatusEnum.UNREAD): IInvitation =>
  ({
    id: Math.random(),
    notificationStatus: status,
  }) as unknown as IInvitation;

/* ------------------------------------------------------------------ */
/*                                Tests                               */
/* ------------------------------------------------------------------ */
describe('Header component', () => {
  // утилита для удобного рендера
  const renderHeader = (invs: IInvitation[] = [], onToggle: jest.Mock = jest.fn()) =>
    render(<Header handleToggleDrawwer={onToggle} invitations={invs} />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user info and avatar', () => {
    renderHeader();

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@mail.com')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveTextContent('alice.png');
  });

  it('shows unread badge with correct count', () => {
    renderHeader([
      dummyInvitation(NotificationStatusEnum.UNREAD),
      dummyInvitation(NotificationStatusEnum.UNREAD),
      dummyInvitation(NotificationStatusEnum.READ),
    ]);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not render badge when there are no unread invitations', () => {
    renderHeader([dummyInvitation(NotificationStatusEnum.READ)]);
    expect(screen.queryByText(/^\d+$/)).toBeNull();
  });

  it('opens profile modal on settings click', () => {
    renderHeader();
    expect(modalSpy).toHaveBeenCalledWith(false); // закрыта по умолчанию

    fireEvent.click(screen.getByRole('button', { name: /настройки профиля/i }));
    expect(modalSpy).toHaveBeenLastCalledWith(true);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('calls drawer toggle handler on notifications click', () => {
    const toggleMock = jest.fn();

    renderHeader([], toggleMock);

    // Кнопка без aria-label → берём первую без атрибута
    const notifBtn = screen.getAllByRole('button').find((btn) => !btn.getAttribute('aria-label')) as HTMLButtonElement;

    fireEvent.click(notifBtn);
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });
});
