import axios from 'axios';

import { IUser } from '@/models/models';

export class AuthApi {
  static async login(input: { email: string; password: string }) {
    const { data } = await axios.post<{ accessToken: string; user: IUser }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      input,
      { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    );

    return data;
  }

  static async register(formData: FormData) {
    const { data } = await axios.post<{ accessToken: string; user: IUser }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      formData,
      { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return data;
  }

  static async forgotPassword(input: { email: string }) {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, input);
  }

  static async resetPassword(token: string, password: string) {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/${token}`, { password });
  }

  static logout() {
    return axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {}, { withCredentials: true });
  }

  static signInWithGoogle() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  }
}
