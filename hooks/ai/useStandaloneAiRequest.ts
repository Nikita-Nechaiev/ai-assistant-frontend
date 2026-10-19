import { useRef, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { IAiToolUsage, AITool } from '@/models/models';
import { SnackbarStatusEnum } from '@/models/enums';
import { AiUsageApi } from '@/services/AiUsageApi';
import { validateAiInput, ValidAiInput } from '@/helpers/validateAiInput';
import { invalidateAiQueries } from '@/lib/queryInvalidation';
import { useUserStore } from '@/store/useUserStore';
import useSnackbarStore from '@/store/useSnackbarStore';

import useAiStepperState from './useAiStepperState';

export default function useStandaloneAiRequest() {
  const flow = useAiStepperState();
  const [result, setResult] = useState<IAiToolUsage | null>(null);
  const pending = useRef(false);
  const { setSnackbar } = useSnackbarStore();
  const userId = useUserStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const mutation = useMutation<IAiToolUsage, Error, ValidAiInput>({
    mutationFn: AiUsageApi.createUsage,
    onSuccess: (data) => {
      setResult(data);
      flow.setCurrentStep(3);
      invalidateAiQueries(queryClient, userId);
    },
    onError: () => setSnackbar('Could not complete your request. Please try again.', SnackbarStatusEnum.ERROR),
    onSettled: () => {
      pending.current = false;
    },
  });
  const submit = () => {
    if (pending.current || mutation.isPending) return;

    const input = validateAiInput(flow.selectedTool, flow.inputValue, flow.targetLanguage);

    if (!input.ok) {
      setSnackbar(input.message, SnackbarStatusEnum.ERROR);

      return;
    }

    pending.current = true;
    mutation.mutate(input.value);
  };
  const restart = () => {
    flow.reset();
    setResult(null);
    mutation.reset();
  };
  const selectTool = (tool: AITool | null) => {
    flow.selectTool(tool);
    mutation.reset();
  };

  return {
    flow: { ...flow, selectTool },
    submit,
    restart,
    result: result?.result,
    isLoading: mutation.isPending,
    errorMessage: mutation.error
      ? 'We couldn’t complete this request. Your text is still here — please try again.'
      : undefined,
  };
}
