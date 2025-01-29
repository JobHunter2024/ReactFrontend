import axios, { AxiosInstance } from 'axios';

export interface loginRequest {
    username: string,
    password: string
}

export interface technology {
    id?: number,
    name: string,
    uri: string,
    userId: number
}

export class UserDataService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL, // Base URL for all API requests
      timeout: 5000, // Optional timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getAuthHeader() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authorization token is missing. Please login.');
    }
    return { Authorization: `Bearer ${token}` };
  }

  public async getAllUserTechnologies(userId: number): Promise<technology[]> {
    try {
      const response = await this.axiosInstance.get<technology[]>(`/technology/user/${userId}`, {
        headers: this.getAuthHeader(),
      });
      console.log('User Technologies', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching user\'s technologies:', error);
      throw error;
    }
  }

  public async addUserTechnology(technology: technology): Promise<void> {
    try {
      await this.axiosInstance.post<technology[]>(`/technology`, technology, {
        headers: this.getAuthHeader(),
      });
      console.log('Successfully added technology to user\'s favourites', technology);
    } catch (error) {
      console.error('Error adding to user\'s technologies:', error);
      throw error;
    }
  }

  public async removeUserTechnology(technology: technology): Promise<void> {
    try {
      await this.axiosInstance.delete<technology[]>(`/technology/${technology.id}`, {
        headers: this.getAuthHeader(),
      });
      console.log('Successfully deleted technology from user\'s favourites', technology);
    } catch (error) {
      console.error('Error removing from user\'s technologies:', error);
      throw error;
    }
  }
}

export default UserDataService;
