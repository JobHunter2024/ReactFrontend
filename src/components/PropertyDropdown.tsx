import React, { useState, useEffect } from 'react';
import { useDropdownContext } from './DropdownContext';
import ObjectPropertyDropdown from './ObjectPropertyDropdown';
import {Property, Entity, Subclass, ApiService} from '../service/ApiService';
import DataPropertyInput from './DataPropertyInput'

interface PropertyDropdownProps {
  selectedEntity: string | null;
  dropdownId: number;
  elementOffsetPath: string[]; // Path to current dropdown in the mainDataObject
  onRemove: (dropdownId: number) => void;
}

const PropertyDropdown: React.FC<PropertyDropdownProps> = ({ selectedEntity, dropdownId, elementOffsetPath, onRemove }) => {
  const { mainDataObject, setMainDataObject } = useDropdownContext();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [availableOptions, setAvailableOptions] = useState<Property[]>([]);
  const [resetKey, setResetKey] = useState(0); // Key to force ObjectPropertyDropdown reset

  const [properties, setProperties] = useState<Property[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [subclasses, setSubclasses] = useState<Subclass[]>([]);

  const api = new ApiService('http://localhost:8888/api/v1');
  
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await api.getEntities();
        setEntities(response);
      } catch (err: any) {
        console.error(err)
      }
    };

    const fetchSubclasses = async () => {
      try {
        const response = await api.getSubclasses(selectedEntity ?? '');
        setSubclasses(response);
      } catch (err: any) {
        console.error(err)
      }
    };

    fetchEntities();
    fetchSubclasses();
  }, []);

  // Helper function to get a nested property from mainDataObject using elementOffsetPath
  const getNestedProperty = (obj: any, path: string[]) => {
    return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  const fetchProperties = async () => {
      try {
        let response: Property[] = [];
        response = await api.fetchProperties(selectedEntity ?? '');
        
        setProperties(response);
      } catch (err: any) {
        console.error(err);
      }
    };

    useEffect(() => {
      if (selectedEntity) {
        fetchProperties();
      } else {
        setProperties([]); // Clear properties when there's no selected entity
      }
    }, [selectedEntity]);
    

  // Helper function to set a nested property in mainDataObject using elementOffsetPath
  const setNestedProperty = (obj: any, path: string[], value: any) => {
    path.reduce((acc, key, index) => {
      if (index === path.length - 1) {
        acc[key] = value;
      } else {
        if (!acc[key]) acc[key] = {}; // Create nested objects if needed
      }
      return acc[key];
    }, obj);
  };

  const computeAvailableOptions = () => {
    // Traverse the mainDataObject using elementOffsetPath to get the correct level
    const targetObj = getNestedProperty(mainDataObject, elementOffsetPath) || {};
    const options = properties.filter(
      (option) =>
        !targetObj.objectProperties?.[option.property] &&
        !targetObj.dataProperties?.[option.property] &&
        option !== selectedProperty
    );
    setAvailableOptions(options);
    console.log("Available options computed:", options);
  };

const handleSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const newValue = event.target.value;
  console.log("New selected value:", newValue);
  console.log("Old value:", selectedProperty);

  // Build the full path string for logging
  const fullPath = elementOffsetPath.concat([newValue]);

  setMainDataObject((prev) => {
    // Get the target object using elementOffsetPath to properly navigate to the correct level
    const targetObj = getNestedProperty(prev, elementOffsetPath); // Ensure targetObj exists

    console.log("Updating object : ",targetObj)

    // Create shallow copies for objectProperties and dataProperties to update them
    const updatedObjectProperties = { ...targetObj.objectProperties };
    const updatedDataProperties = { ...targetObj.dataProperties };

    console.log("object properties init : ",updatedObjectProperties)

    // Remove the previous property if it exists in the root and nested structure
    if (selectedProperty) {
      if (selectedProperty.dataType.toLowerCase().startsWith('http://www.semanticweb.org/ana/')) {
        delete updatedObjectProperties[selectedProperty.property]; // Remove from root
        // Remove from the nested objectProperties
        delete targetObj.objectProperties?.[selectedProperty.property];
      } else if (selectedProperty.dataType.toLowerCase().startsWith('http://www.w3.org/2001/')) {
        delete updatedDataProperties[selectedProperty.property]; // Remove from root
        // Remove from the nested dataProperties
        delete targetObj.dataProperties?.[selectedProperty.property];
      }
    }

    console.log("object properties fin : ",updatedObjectProperties)

    // If the new value is valid, add it to the correct level (nested or root)
    if (newValue) {
      let dataType = properties.find((prop) => prop.property === newValue)?.dataType;
      if (dataType?.toLowerCase().startsWith('http://www.semanticweb.org/ana/')) {
        // Add to the root objectProperties and nested objectProperties
        updatedObjectProperties[newValue] = {
          subject: properties.find((prop) => prop.property === newValue)?.dataType || '',
          instances: [],
          dataProperties: {},
          objectProperties: {},
        };
        setNestedProperty(targetObj, ['objectProperties', newValue], updatedObjectProperties[newValue]);
        console.log(`Updated value at: mainDataObject.objectProperties.${newValue}.objectProperties`); // Log for object
      } else if (dataType?.toLowerCase().startsWith('http://www.w3.org/2001/')) {
        // Add to the root dataProperties and nested dataProperties
        updatedDataProperties[newValue] = '';
        setNestedProperty(targetObj, ['dataProperties', newValue], updatedDataProperties[newValue]);
        console.log(`Updated value at: mainDataObject.dataProperties.${newValue}`); // Log for data
      }
    }

    const updatedPrev = structuredClone(prev);
    let currentObject: any = updatedPrev;  // Use `any` or a more specific type like `Record<string, any>`

    // Traverse through each level of the elementOffsetPath, except for the last one
    for (let i = 0; i < elementOffsetPath.length - 1; i++) {
      const currentKey = elementOffsetPath[i];
      if (!currentObject[currentKey]) {
        console.error(`Key ${currentKey} does not exist in the path`);
        return prev;  // Return the previous state if a key doesn't exist
      }
      currentObject = currentObject[currentKey];  // Navigate deeper into the object
    }

    const subject = currentObject.subject;

    console.log("Current object : ",currentObject)

    // Now, we are at the correct nested level to perform the update
    const lastKey = elementOffsetPath[elementOffsetPath.length - 1];

    console.log("Last key : ",lastKey)

    if (subject && subject.toLowerCase().startsWith('http://www.semanticweb.org/ana/')) {
      currentObject["objectProperties"] = updatedObjectProperties;
      currentObject["dataProperties"] = updatedDataProperties;
    } else {
      if (currentObject[lastKey]) {
        currentObject[lastKey]["objectProperties"] = updatedObjectProperties;
        currentObject[lastKey]["dataProperties"] = updatedDataProperties;
      }
    }
    
    ////// INSERT MODIFIED LISTS INTO UPDATEDPREV, IF UPDATEDPREV DOES NOT MATCH WITH ROOT DATAOBJET CHANGES WILL NOT BE REFLECTED

    // Return the updated mainDataObject
    return updatedPrev;
  });

  if (newValue !== selectedProperty?.property) {
    setResetKey((prev) => prev + 1); // Increment the key to force ObjectPropertyDropdown reset
  }

  setSelectedProperty(properties.find((prop) => prop.property === newValue) || null);
  computeAvailableOptions(); // Recompute options after selection
  console.log("Updated selectedProperty:", newValue);
};

const handleRemove = () => {
  console.log("Remove path:", elementOffsetPath); // Log the remove path

  setMainDataObject((prev) => {
    const updatedPrev = structuredClone(prev);
    let currentObject: any = updatedPrev;

    // Traverse through each level of the elementOffsetPath
    for (let i = 0; i < elementOffsetPath.length - 1; i++) {
      const currentKey = elementOffsetPath[i];
      if (!currentObject[currentKey]) {
        console.error(`Key ${currentKey} does not exist in the path`);
        return prev; // Return the previous state if a key doesn't exist
      }
      currentObject = currentObject[currentKey];
    }

    console.log("Current object before modification: ", currentObject);

    const lastKey = elementOffsetPath[elementOffsetPath.length - 1];
    console.log("Last key: ", lastKey);

    // Extract subject before modifying
    const subject = currentObject.subject;

    // Perform modifications safely
    const updatedObjectProperties = { ...currentObject[lastKey]?.objectProperties };
    const updatedDataProperties = { ...currentObject[lastKey]?.dataProperties };

    if (selectedProperty) {
      if (selectedProperty.dataType.toLowerCase().startsWith('http://www.semanticweb.org/ana/')) {
        delete updatedObjectProperties[selectedProperty.property];
      } else if (selectedProperty.dataType.toLowerCase().startsWith('http://www.w3.org/2001/')) {
        delete updatedDataProperties[selectedProperty.property];
      }
    }

    console.log("Updated object properties: ", updatedObjectProperties);
    console.log("Updated data properties: ", updatedDataProperties);

    // FLAWED LOGIC, we need to figure out if we're on layer 0 for first branch of exec
    if (subject && elementOffsetPath.length<2) {
      currentObject["objectProperties"] = updatedObjectProperties;
      currentObject["dataProperties"] = updatedDataProperties;
    } else {
      if (currentObject[lastKey]) {
        currentObject[lastKey]["objectProperties"] = updatedObjectProperties;
        currentObject[lastKey]["dataProperties"] = updatedDataProperties;
      }
    }

    console.log("Current object after modification: ", currentObject);

    // Return the updated mainDataObject
    return updatedPrev;
  });

  onRemove(dropdownId);
};

return (
  <div className="mt-2" style={{ paddingLeft: '50px' }}>
    <label htmlFor={`property-dropdown-${dropdownId}`}>Select Property:</label>
    <select
      id={`property-dropdown-${dropdownId}`}
      value={selectedProperty?.property || ''}
      onFocus={computeAvailableOptions} // Compute options when dropdown gains focus
      onChange={handleSelection}
    >
      <option value="">-- Select an Option --</option>
      {availableOptions.map((option) => (
        <option key={option.property} value={option.property}>
          {option.propertyLabel}
        </option>
      ))}
    </select>
    <button className="btn btn-danger mt-2" onClick={handleRemove}>
      Remove Property
    </button>

    {selectedProperty?.dataType.toLowerCase().startsWith('http://www.semanticweb.org/ana/') && (
      <div className="mt-3">
        {/* Use the resetKey to force reset */}
        <ObjectPropertyDropdown key={resetKey} predefinedEntity={selectedProperty.dataType} elementOffsetPath={[...elementOffsetPath, "objectProperties", selectedProperty.property]}/>
      </div>
    )}

    {selectedProperty?.dataType.toLowerCase().startsWith('http://www.w3.org/2001/') && (
      <div className="mt-3">
        <DataPropertyInput
          dataType={selectedProperty.dataType}
          elementOffsetPath={[...elementOffsetPath, 'dataProperties', selectedProperty.property]}
        />
      </div>
    )}
  </div>
);
};

export default PropertyDropdown;
