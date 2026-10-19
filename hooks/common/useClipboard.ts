import { useCallback } from 'react';

import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';

export default function useClipboard(
  successMessage = 'Text copied to clipboard!',
  errorMessage = 'Could not copy the text. Please select and copy it manually.',
) {
  const { setSnackbar } = useSnackbarStore();

  return useCallback(
    async (text?: string) => {
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        setSnackbar(successMessage, SnackbarStatusEnum.SUCCESS);
      } catch {
        setSnackbar(errorMessage, SnackbarStatusEnum.ERROR);
      }
    },
    [setSnackbar, successMessage, errorMessage],
  );
}
