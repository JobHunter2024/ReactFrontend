import axios, { AxiosInstance } from 'axios';
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
        "value": Object,
        "instanceOfValues": string
  }

  export interface Job {
    dateRemoved : string;
    label : string;
    job : string;
    relatedSkills : string;
  }

  export interface Suggestion {
    [key: string]: {
      [key: string]: {
        relations: string[];
      };
    };
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

  public async getSuggestions(iri: string[]): Promise<any> {
    try {
      // Make the API call
      const response = await axios.post<Suggestion[]>("http://localhost:5000/api/v1/sparql/suggestions", {
        technologies: iri
      });
  
      // Decode the response
      const decodedRelations = Object.entries(response.data).map(([technology, details]) => {
        const technologyName = technology.split('#')[1]; // Extract the technology name from the URI
        const relations = Object.entries(details).map(([dependency, relationDetails]) => {
          const dependencyName = dependency.split('#')[1]; // Extract dependency name from the URI
          const relationsList = relationDetails.relations; // Array of relations
          return { dependencyName, relationsList };
        });
  
        return {
          technologyName,
          relations
        };
      });
  
      return decodedRelations;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      throw error;
    }
  }

  public async getJobs() {
    try {
        const response = await axios.get<Job[]>("http://localhost:8888/api/v1/entities/jobs");

        return response.data;
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        throw(error);
      }
  }

  public async getSkillData(uri: string) {
    try {
      const response = await axios.post<any>("http://localhost:5001/api/v1/wiki_link", {
        iri: uri,
      });
  
      // Check if the response contains an error field
      if (response.data && response.data.error) {
        console.error(`Error: ${response.data.error}`);
        return null; // Return null if error is present in the response
      }
  
      return response.data; // Return the response data if no error
  
    } catch (error) {
      console.error("Error fetching skill data:", error);
      return null; // Return null in case of request failure
    }
  }

}

export default ApiService;