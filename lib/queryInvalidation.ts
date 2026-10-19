import { QueryClient } from '@tanstack/react-query';

import { queryKeys } from './queryKeys';

export function invalidateSessionQueries(client: QueryClient, userId?: number) {
  if (!userId) return;

  void client.invalidateQueries({ queryKey: queryKeys.sessions(userId) });
  void client.invalidateQueries({ queryKey: queryKeys.dashboard(userId) });
}

export function invalidateAiQueries(client: QueryClient, userId?: number) {
  if (!userId) return;

  void client.invalidateQueries({ queryKey: queryKeys.ai(userId) });
  void client.invalidateQueries({ queryKey: queryKeys.dashboard(userId) });
}
