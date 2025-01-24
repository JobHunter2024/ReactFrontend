import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the structure of the new DataObject
export interface DataObject {
  subject: string;
  instances: string[];
  dataProperties: Record<string, any>;
  objectProperties: Record<string, DataObject>;
}

interface DropdownContextType {
  mainDataObject: DataObject;
  setMainDataObject: React.Dispatch<React.SetStateAction<DataObject>>;
}

// Define the type for DropdownProvider props including children
interface DropdownProviderProps {
  children: ReactNode;  // Explicitly define the type of children
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const DropdownProvider: React.FC<DropdownProviderProps> = ({ children }) => {
  // Initialize the mainDataObject state
  const [mainDataObject, setMainDataObject] = useState<DataObject>({
    subject: '',
    instances: [],
    dataProperties: {},
    objectProperties: {},
  });

  return (
    <DropdownContext.Provider value={{ mainDataObject, setMainDataObject }}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdownContext must be used within a DropdownProvider');
  }
  return context;
};
