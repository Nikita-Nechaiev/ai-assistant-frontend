export class PublicInfoApi {
  static async fetchCv(): Promise<Blob> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

    if (!apiUrl) throw new Error('API URL is not configured.');

    const response = await fetch(`${apiUrl}/public-info/cv`, {
      credentials: 'omit',
      headers: { Accept: 'application/pdf' },
    });

    if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) {
      throw new Error('Could not download the resume.');
    }

    return response.blob();
  }
}
