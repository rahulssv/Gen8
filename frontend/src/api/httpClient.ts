import { API_BASE_URL } from './config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  queryParams?: Record<string, string>;
}

export class HttpClient {
  private getDefaultHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (options.queryParams) {
      Object.entries(options.queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: this.getDefaultHeaders(),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return this.handleResponse<T>(response);
  }
}