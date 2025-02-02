import axios, { AxiosInstance } from 'axios';

export type JobData = {
    job: string;
    datePosted: string;
    dateRemoved: string | null;
  };
export type ChartData = {
    date: string;
    availableJobs: number;
    removedJobs: number;
  };

export class StatisticsService {
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


  
    public async getEntityInstances(entityId: string): Promise<JobData[]> {
        try {
          const response = await this.axiosInstance.post<JobData[]>(`/stats/skill`,
            { entityClass: entityId }
          );
          return response.data;
        } catch (error) {
          console.error("Error fetching specific instances:", error);
          throw error;
        }
      }
  }
  
  export default StatisticsService;