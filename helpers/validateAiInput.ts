import { AITool } from '@/models/models';

export type ValidAiInput = { tool: AITool; text: string; targetLanguage?: string };

export function validateAiInput(
  tool: AITool | null,
  text: string,
  language: string,
): { ok: true; value: ValidAiInput } | { ok: false; message: string } {
  if (!tool) return { ok: false, message: 'Choose an AI tool first.' };

  if (!text.trim()) return { ok: false, message: 'Input cannot be empty' };

  if (tool.requiresTargetLanguage && !language.trim())
    return { ok: false, message: 'Please specify a target language' };

  return {
    ok: true,
    value: { tool, text: text.trim(), ...(tool.requiresTargetLanguage && { targetLanguage: language.trim() }) },
  };
}
