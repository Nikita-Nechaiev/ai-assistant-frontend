import axiosInstance from './axiosInstance';

export interface DailyActivity {
  date: string;
  documentsCreated: number;
  aiRequests: number;
}

export interface DashboardStatisticsData {
  overview: {
    totalTimeSpentSeconds: number;
    totalTimeSpentLabel: string;
    totalDocuments: number;
    totalSessions: number;
    createdSessions: number;
    joinedSessions: number;
  };
  activity: {
    startDate: string;
    endDate: string;
    timeZone: 'UTC';
    days: DailyActivity[];
    totals: Omit<DailyActivity, 'date'>;
    maxDailyCount: number;
  };
}

export class StatisticsApi {
  static async fetchDashboard(signal?: AbortSignal): Promise<DashboardStatisticsData> {
    const { data } = await axiosInstance.get<DashboardStatisticsData>(
      '/statistics/dashboard',
      signal ? { signal } : undefined,
    );

    return data;
  }
}
