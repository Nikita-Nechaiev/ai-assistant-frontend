'use client';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import MainLayout from '@/components/Dashboard/Layout';
import { SnackbarStatusEnum } from '@/models/enums';
import { AITool, IAiToolUsage } from '@/models/models';
import useSnackbarStore from '@/store/useSnackbarStore';
import axiosInstance from '@/services/axiosInstance';
import Step1SelectTool from '@/components/AiAssistance/Step1SelectTool';
import Step2Input from '@/components/AiAssistance/Step2Input';
import Step3Success from '@/components/AiAssistance/Step3Success';

export default function AiAssistanceStepperPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>(''); // for Translation
  const [result, setResult] = useState<IAiToolUsage | null>(null);

  const { setSnackbar } = useSnackbarStore();

  const mutation = useMutation<IAiToolUsage, Error, void>({
    mutationFn: async () => {
      if (!selectedTool) {
        throw new Error('No tool selected');
      }

      const payload: any = {};
      if (selectedTool.requiresTargetLanguage) {
        payload['text'] = inputValue;
        payload['targetLanguage'] = targetLanguage;
      } else {
        payload[selectedTool.bodyField] = inputValue;
      }

      const response = await axiosInstance.post<IAiToolUsage>(
        `/ai-tool-usage/${selectedTool.endpoint}`,
        payload,
      );

      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
      setCurrentStep(3);
    },
    onError: (error) => {
      setSnackbar(
        error?.message || 'An error occurred',
        SnackbarStatusEnum.ERROR,
      );
    },
  });

  const handleSubmit = () => {
    if (!inputValue) {
      setSnackbar('Input cannot be empty', SnackbarStatusEnum.ERROR);
      return;
    }
    if (selectedTool?.requiresTargetLanguage && !targetLanguage) {
      setSnackbar('Please specify a target language', SnackbarStatusEnum.ERROR);
      return;
    }
    mutation.mutate();
  };

  const handleCopyResult = () => {
    if (result?.result) {
      navigator.clipboard.writeText(result.result);
      setSnackbar('Result copied to clipboard', SnackbarStatusEnum.SUCCESS);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedTool(null);
    setInputValue('');
    setTargetLanguage('');
    setResult(null);
    mutation.reset();
  };

  return (
    <MainLayout>
      <div className='py-8 px-4'>
        {currentStep === 1 && (
          <Step1SelectTool
            selectedTool={selectedTool}
            onToolSelect={(tool) => {
              setSelectedTool(tool);
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && selectedTool && (
          <Step2Input
            selectedTool={selectedTool}
            inputValue={inputValue}
            onInputChange={setInputValue}
            targetLanguage={targetLanguage}
            onTargetLanguageChange={setTargetLanguage}
            onSubmit={handleSubmit}
            onGoBack={() => setCurrentStep(1)}
            isLoading={mutation.isPending}
          />
        )}

        {currentStep === 3 && (
          <Step3Success
            result={result?.result}
            onCopyResult={handleCopyResult}
            onRestart={handleRestart}
          />
        )}
      </div>
    </MainLayout>
  );
}
