import { SnackbarStatusEnum } from '@/models/enums';

import useSnackbarStore from '../useSnackbarStore';

describe('useSnackbarStore', () => {
  beforeEach(() => {
    useSnackbarStore.setState({ message: null, status: null });
  });

  it('initialises with message and status set to null', () => {
    const { message, status } = useSnackbarStore.getState();

    expect(message).toBeNull();
    expect(status).toBeNull();
  });

  it('setSnackbar stores the supplied message and status', () => {
    useSnackbarStore.getState().setSnackbar('Hello world', SnackbarStatusEnum.SUCCESS);

    const { message, status } = useSnackbarStore.getState();

    expect(message).toBe('Hello world');
    expect(status).toBe(SnackbarStatusEnum.SUCCESS);
  });

  it('setSnackbar overrides any existing message/status', () => {
    const { setSnackbar } = useSnackbarStore.getState();

    setSnackbar('First', SnackbarStatusEnum.WARNING);
    setSnackbar('Second', SnackbarStatusEnum.ERROR);

    const { message, status } = useSnackbarStore.getState();

    expect(message).toBe('Second');
    expect(status).toBe(SnackbarStatusEnum.ERROR);
  });

  it('closeSnackbar clears both message and status', () => {
    const { setSnackbar, closeSnackbar } = useSnackbarStore.getState();

    setSnackbar('Will be cleared', SnackbarStatusEnum.WARNING);
    closeSnackbar();

    const { message, status } = useSnackbarStore.getState();

    expect(message).toBeNull();
    expect(status).toBeNull();
  });

  it('closeSnackbar is idempotent (safe to call multiple times)', () => {
    const { closeSnackbar } = useSnackbarStore.getState();

    closeSnackbar();
    closeSnackbar();

    const { message, status } = useSnackbarStore.getState();

    expect(message).toBeNull();
    expect(status).toBeNull();
  });
});
