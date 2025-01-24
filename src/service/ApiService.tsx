import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {DataObject} from '../components/DropdownContext';
export interface Entity {
    description: string;
    label: string;
    class: string;
  }

  export interface EntityInstance {
    subclass: string;
    label: string;
    description: string;
  }
  
  export interface Property {
    propertyLabel: string;
    dataType: string;
    property: string;
  }
  
  export interface Subclass {
    subclass: string;
    label: string;
    description: string;
  }

  export interface InstanceData {
        "propertyDescription": string,
        "propertyLabel": string,
        "property": string,
        "value": Object
  }

  export interface Suggestion {
    "intermediateRelatedSkill": string,
    "intermediateRelation": string,
    "relatedSkill": string,
    "relation": string,
    "resourceUri": string
  }

export class ApiService {
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

  public async fetchProperties(entityId: string): Promise<Property[]> {
    try {
      const response = await this.axiosInstance.post<Property[]>('/entities/properties', {
        entityClass: entityId,
      });
      console.log('Updated properties:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error; // Re-throw error for the calling component to handle
    }
  }

  public async getEntities(): Promise<Entity[]> {
    try {
      const response = await this.axiosInstance.get<Entity[]>('/entities');
      console.log('Fetched entities:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching entities:', error);
      throw error; // Re-throw error for the calling component to handle
    }
  }

  public async getEntityInstances(entityId: string): Promise<EntityInstance[]> {
    try {
      const response = await this.axiosInstance.post<EntityInstance[]>(`/entities/instances`,
        { entityClass: entityId }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching specific instances:", error);
      throw error;
    }
  }

  public async getSubclasses(entityClass : string): Promise<Subclass[]> {
    try {
      const response = await this.axiosInstance.post<Subclass[]>("/entities/subclasses",
        { entityClass }
      );
      console.log('Fetched subclasses:', response);

      return response.data;
    } catch (error) {
      console.error("Error fetching subclass data:", error);
      throw(error);
    }
  };

  public async getFilteredEntityInstances(entityClasses : string[], searchTerm : string): Promise<EntityInstance[]> {
    try {
        const response = await this.axiosInstance.post<EntityInstance[]>("/entities/subclasses/filter",{ 
                entityClasses : entityClasses,
                searchTerm : searchTerm
            }
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching subclass data:", error);
        throw(error);
      }
  }

  public async getDataOfInstance(entityClass : string): Promise<InstanceData[]> {
    try {
        const response = await this.axiosInstance.post<InstanceData[]>("/entities/data",{ 
                entityClass : entityClass
            }
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching subclass data:", error);
        throw(error);
      }
  }

  public async executeQuery(dataObject : DataObject) {
    try {
        const response = await axios.post<EntityInstance[]>("http://localhost:8887/api/v1/query/generate", dataObject
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching subclass data:", error);
        throw(error);
      }
  }

  public async getSuggestions(iri : string) {
    try {
        const response = await axios.post<Suggestion[]>("http://localhost:5000/api/v1/sparql/query", {
          "iri" : iri
        }
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        throw(error);
      }
  }

}

export default ApiService;