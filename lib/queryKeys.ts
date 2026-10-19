export const queryKeys = {
  user: (userId: number | undefined) => ['user', userId] as const,
  sessions: (userId: number | undefined) => [...queryKeys.user(userId), 'sessions'] as const,
  sessionList: (userId: number | undefined, search: string) => [...queryKeys.sessions(userId), search] as const,
  ai: (userId: number | undefined) => [...queryKeys.user(userId), 'ai'] as const,
  aiHistory: (userId: number | undefined, search: string) => [...queryKeys.ai(userId), 'history', search] as const,
  aiStatistics: (userId: number | undefined) => [...queryKeys.ai(userId), 'statistics'] as const,
  dashboard: (userId: number | undefined) => [...queryKeys.user(userId), 'statistics', 'dashboard'] as const,
};
