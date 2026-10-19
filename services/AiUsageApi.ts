import { IAiToolUsage } from '@/models/models';
import { ValidAiInput } from '@/helpers/validateAiInput';

import axiosInstance from './axiosInstance';

export interface AiUsageStatistics {
  mostFrequentTool: string | null;
  totalUsageNumber: number;
  totalWordCount: number;
  mostInDayUsage: string | null;
  firstAiUsage: string | null;
}

export class AiUsageApi {
  static async createUsage({ tool, text, targetLanguage }: ValidAiInput): Promise<IAiToolUsage> {
    const payload = { [tool.bodyField]: text, ...(targetLanguage && { targetLanguage }) };
    const { data } = await axiosInstance.post<IAiToolUsage>(`/ai-tool-usage/${tool.endpoint}`, payload);

    return data;
  }

  static async fetchUsage(page = 1, search = '', signal?: AbortSignal) {
    const { data } = await axiosInstance.get<IAiToolUsage[]>('/ai-tool-usage/user', {
      params: { page, limit: 8, search },
      ...(signal && { signal }),
    });

    return data;
  }

  static async fetchStatistics(signal?: AbortSignal) {
    const { data } = await axiosInstance.get<AiUsageStatistics>(
      '/ai-tool-usage/user/most-used-tool',
      signal ? { signal } : undefined,
    );

    return data;
  }
}
