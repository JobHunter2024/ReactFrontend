import React, { useState, useEffect } from 'react';
import { useDropdownContext } from './DropdownContext';
import InstancesDropdown from './InstancesDropdown';
import PropertyDropdown from './PropertyDropdown';
import {Property, Subclass, ApiService} from '../service/ApiService';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

interface NestedPropertyDropdownProps {
  predefinedEntity: string | null;  // New prop for predefined entity
  elementOffsetPath: string[]; // Path to current dropdown in the mainDataObject
}

const ObjectPropertyDropdown: React.FC<NestedPropertyDropdownProps> = ({ predefinedEntity, elementOffsetPath }) => {
  const { mainDataObject, setMainDataObject } = useDropdownContext();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedSubclasses, setSelectedSubclasses] = useState<string[]>([]); // List of selected subclasses
  const [propertyDropdowns, setPropertyDropdowns] = useState<{ id: number }[]>([]); // Tracks added dropdowns with unique IDs
  const [dropdownCounter, setDropdownCounter] = useState(0);

  const [properties, setProperties] = useState<Property[]>([]);
  const [subclasses, setSubclasses] = useState<Subclass[]>([]);
  
  const api = new ApiService('http://localhost:8888/api/v1');

  const fetchProperties = async () => {
        try {
          let response: Property[] = [];
          response = await api.fetchProperties(predefinedEntity ?? '');
          
          setProperties(response);
        } catch (err: any) {
          console.error(err);
        }
      };

    const fetchSubclasses = async () => {
     try {
        const response = await api.getSubclasses(predefinedEntity ?? '');
        const filteredSubclasses = response.filter((subclass: Subclass) => subclass.subclass !== predefinedEntity);
        setSubclasses(filteredSubclasses);
      } catch (err: any) {
        console.error(err)
      }
    };

  useEffect(() => {
    // If predefinedEntity is provided, set it as the selectedProperty
    if (predefinedEntity) {
      setSelectedProperty(predefinedEntity);
      fetchSubclasses();
    }
  }, [predefinedEntity]);

  const handleSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;

    setMainDataObject((prev) => {
      const updatedObject = { ...prev };
      let current: any = updatedObject;

      // Traverse to the correct location based on elementOffsetPath
      for (const key of elementOffsetPath) {
        if (typeof current[key] !== 'object') {
          throw new Error(`Invalid path: ${key} is not an object`);
        }
        current = current[key];
      }

      // If selectedProperty exists, delete the previous property if any
      if (selectedProperty) {
        delete current.objectProperties?.[selectedProperty];
        delete current.dataProperties?.[selectedProperty];
      }

      // Add new property based on the selected value
      if (newValue.toLowerCase().startsWith('object')) {
        current.objectProperties[newValue] = {
          subject: newValue,
          instances: [],
          dataProperties: {},
          objectProperties: {},
        };
      } else if (newValue.toLowerCase().startsWith('data')) {
        current.dataProperties[newValue] = '';
      }

      return updatedObject;
    });

    setSelectedProperty(newValue); // Update selected property after change
  };

  const handleAddDropdown = () => {
    setPropertyDropdowns((prev) => [...prev, { id: dropdownCounter }]);
    setDropdownCounter((prev) => prev + 1);
  };

  const handleRemoveDropdown = (dropdownId: number) => {
    setPropertyDropdowns((prev) => prev.filter((dropdown) => dropdown.id !== dropdownId));
    setMainDataObject((prev) => {
      const updatedObjectProperties = { ...prev.objectProperties };

      return {
        ...prev,
        objectProperties: updatedObjectProperties,
      };
    });
  };

  // Handle selecting/deselecting subclasses
    const handleSubclassSelection = (event: React.ChangeEvent<HTMLInputElement>, subclass: Subclass) => {
      const isChecked = event.target.checked;
      setSelectedSubclasses((prev) =>
        isChecked ? [...prev, subclass.subclass] : prev.filter((item) => item !== subclass.subclass)
      );
    };

  return (
    <div>
      {subclasses.length > 0 && (
        <Card className="mt-4">
          <Card.Header>Select Subclasses:</Card.Header>
          <ListGroup variant="flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {subclasses.map((subclass) => (
              <ListGroup.Item key={subclass.subclass}>
                <Form.Check
                  type="checkbox"
                  id={`subclass-${subclass.subclass}`}
                  label={subclass.label}
                  value={subclass.subclass}
                  checked={selectedSubclasses.includes(subclass.subclass)}
                  onChange={(e) => handleSubclassSelection(e, subclass)}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}
      
        {predefinedEntity && (
        <>
          <InstancesDropdown 
            selectedEntity={predefinedEntity} 
            selectedSubclasses={selectedSubclasses ?? [predefinedEntity]} 
            elementOffsetPath={elementOffsetPath} 
          />

          <button className="mt-3 btn btn-primary" onClick={handleAddDropdown}>
            Add Property Dropdown
          </button>
        </>
      )}

      {/* Render Property Dropdowns */}
      {propertyDropdowns.map(({ id }) => (
        <div key={id} className="mt-3">
          <PropertyDropdown
            selectedEntity={predefinedEntity}
            dropdownId={id}
            onRemove={handleRemoveDropdown} // Pass the callback
            elementOffsetPath={elementOffsetPath}
          />
        </div>
      ))}
    </div>
  );
};

export default ObjectPropertyDropdown;
