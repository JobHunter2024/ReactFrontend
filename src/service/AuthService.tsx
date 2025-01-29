import axios, { AxiosInstance } from 'axios';

export interface loginRequest {
    username: string,
    password: string
}

export interface registerRequest {
    email: string,
    password: string,
    username: string
}


export class AuthService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL, // Base URL for all API requests
      timeout: 5000, // Optional timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request and response interceptors if needed
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authorization tokens or other modifications
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle errors globally
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  public async login(request: loginRequest): Promise<string> {
    try {
      const response = await this.axiosInstance.post<string>('/login', request);
      console.log('Login Response', response);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error; // Re-throw error for the calling component to handle
    }
  }

  public async register(request: registerRequest): Promise<void> {
    try {
      await this.axiosInstance.post<string>('/register', request);
      console.log('Register Successful');
    } catch (error) {
      console.error('Error registering:', error);
      throw error; // Re-throw error for the calling component to handle
    }
  }
}

export default AuthService;