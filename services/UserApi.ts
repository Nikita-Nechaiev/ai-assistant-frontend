import { IUser } from '@/models/models';

import axiosInstance from './axiosInstance';

export class UserApi {
  static async updateProfile(formData: FormData) {
    const { data } = await axiosInstance.patch<{ message: string; user: IUser }>('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.user;
  }
}
