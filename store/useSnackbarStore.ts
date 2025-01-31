import { SnackbarStatusEnum } from '@/models/enums';
import { create } from 'zustand';

interface SnackbarState {
  message: string | null;
  status: SnackbarStatusEnum | null;
  setSnackbar: (message: string, status: SnackbarStatusEnum) => void;
  closeSnackbar: () => void;
}

const useSnackbarStore = create<SnackbarState>((set) => ({
  message: null,
  status: null,
  setSnackbar: (message, status) => {
    set({ message, status });
  },
  closeSnackbar: () => {
    set({ message: null, status: null });
  },
}));

export default useSnackbarStore;
