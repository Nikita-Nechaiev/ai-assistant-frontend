'use client';
import React, { useCallback, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import MainLayout from '@/components/Dashboard/Layout';
import { SnackbarStatusEnum } from '@/models/enums';
import { AITool, IAiToolUsage } from '@/models/models';
import useSnackbarStore from '@/store/useSnackbarStore';
import axiosInstance from '@/services/axiosInstance';
import AiAsssistanceStepper from '@/components/AiAssistance/AiAssistanceStepper';

export default function AiAssistanceStepperPage() {
  const [result, setResult] = useState<IAiToolUsage | null>(null);
  const { setSnackbar } = useSnackbarStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('');

  const mutation = useMutation<IAiToolUsage, Error, { inputValue: string }>({
    mutationFn: async (inputValue) => {
      if (!selectedTool) {
        throw new Error('No tool selected');
      }

      const payload: any = {};

      if (selectedTool.requiresTargetLanguage) {
        payload.text = inputValue.inputValue;
        payload.targetLanguage = targetLanguage;
      } else {
        payload[selectedTool.bodyField] = inputValue.inputValue;
      }

      const response = await axiosInstance.post<IAiToolUsage>(`/ai-tool-usage/${selectedTool.endpoint}`, payload);

      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
      setCurrentStep(3);
    },
    onError: (error) => {
      setSnackbar(error?.message || 'An error occurred', SnackbarStatusEnum.ERROR);
    },
  });

  const handleSubmit = useCallback(
    (inputValue: string) => {
      if (!inputValue.trim()) {
        setSnackbar('Input cannot be empty', SnackbarStatusEnum.ERROR);

        return;
      }

      if (selectedTool?.requiresTargetLanguage && !targetLanguage) {
        setSnackbar('Please specify a target language', SnackbarStatusEnum.ERROR);

        return;
      }

      mutation.mutate({ inputValue: inputValue });
    },
    [setSnackbar, selectedTool, targetLanguage, mutation],
  );

  const handleRestart = useCallback(() => {
    setResult(null);
    mutation.reset();
  }, [setResult, mutation]);

  return (
    <MainLayout>
      <AiAsssistanceStepper
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        isOnDocumentPage={false}
        setCurrentStep={setCurrentStep}
        currentStep={currentStep}
        onSubmit={handleSubmit}
        onRestart={handleRestart}
        isLoading={mutation.isPending}
        result={result?.result}
      />
    </MainLayout>
  );
}
