import { ISessionItem, ICollaborationSession } from '@/models/models';

import axiosInstance from './axiosInstance';

export class SessionApi {
  static async fetchUserSessions(page = 1, search = '') {
    const { data } = await axiosInstance.get<ISessionItem[]>('/collaboration-session/get-user-sessions', {
      params: { page, search },
    });

    return data;
  }

  static async createSession(name: string) {
    const { data } = await axiosInstance.post<ICollaborationSession>('/collaboration-session/create', {
      name: name.trim(),
    });

    return data;
  }
}
