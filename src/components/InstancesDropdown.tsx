import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDropdownContext } from './DropdownContext';
import { EntityInstance, ApiService } from '../service/ApiService';
import { Form, InputGroup, Button, ListGroup, Collapse } from 'react-bootstrap';

interface InstancesDropdownProps {
  selectedEntity: string;
  elementOffsetPath: string[]; // Path to the location in mainDataObject
  selectedSubclasses: string[];
}

const InstancesDropdown: React.FC<InstancesDropdownProps> = ({ selectedEntity, elementOffsetPath, selectedSubclasses }) => {
  const { mainDataObject, setMainDataObject } = useDropdownContext();
  const [selectedInstances, setSelectedInstances] = useState<EntityInstance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [instances, setInstances] = useState<EntityInstance[]>([]);
  const [isOpen, setIsOpen] = useState(false); // State to toggle collapsible content


  const [searchTerm, setSearchTerm] = useState<string>();

  const api = new ApiService('http://localhost:8888/api/v1');

  const memoizedElementOffsetPath = useMemo(() => elementOffsetPath, [elementOffsetPath]);

  const fetchEntities = async () => {
    try {
      let response: EntityInstance[] = [];
      if (selectedSubclasses?.length) {
        response = await api.getFilteredEntityInstances(selectedSubclasses, searchTerm ?? '');
      } else {
        response = await api.getFilteredEntityInstances([selectedEntity], searchTerm ?? '');
      }
      setInstances(response);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [selectedSubclasses, searchTerm, selectedEntity]);

  // Only update if selectedInstances actually changes
  const updateMainDataObject = useCallback(() => {

    setMainDataObject((prevMainDataObject) => {
      const updatedObject = { ...prevMainDataObject };
      let current: any = updatedObject;

      try {
        // Traverse the object based on memoizedElementOffsetPath
        for (let i = 0; i < memoizedElementOffsetPath.length; i++) {
          const pathPart = memoizedElementOffsetPath[i];

          if (i === 0 && pathPart === 'objectProperties') {
            current = current.objectProperties;
          } else if (i === 1) {
            const key = pathPart;
            if (typeof current[key] !== 'object') {
              throw new Error(`Invalid path: ${key} is not an object`);
            }
            current = current[key];
          } else {
            if (typeof current[pathPart] !== 'object') {
              throw new Error(`Invalid path: ${pathPart} is not an object`);
            }
            current = current[pathPart];
          }
        }

        // Update the instances path with the selected instances' labels
        const selectedInstancesLabels: string[] = selectedInstances.map((element) => element.subclass);
        current.instances = selectedInstancesLabels;

        return updatedObject;
      } catch (error) {
        console.error('Error updating mainDataObject:', error);
        return prevMainDataObject;
      }
    });
  }, [memoizedElementOffsetPath, selectedInstances, setMainDataObject]);

  // Ensure updateMainDataObject is only called when selectedInstances changes
  useEffect(() => {
    updateMainDataObject();
  }, [selectedInstances]); // Trigger update only on changes to selectedInstances

  const handleCheckboxChange = (option: EntityInstance) => {
    setSelectedInstances((prev) => {
      if (prev.includes(option)) {
        return prev.filter((instance) => instance !== option); // Remove if already selected
      }
      return [...prev, option]; // Add if not selected
    });
  };

  // Sort options: selected options come first
  const sortedOptions = [...selectedInstances, ...instances.filter((option) => !selectedInstances.includes(option))];

  // Filter options based on the search query
  const filteredOptions = sortedOptions.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mt-3">
      <Button
        variant="primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-controls="instances-dropdown-collapse"
        aria-expanded={isOpen}
        className="mb-2"
      >
        {isOpen ? 'Hide Instances' : 'Show Instances'}
      </Button>

      <Collapse in={isOpen}>
        <div id="instances-dropdown-collapse">
          <Form.Label htmlFor="search-bar">Search Instances:</Form.Label>
          <InputGroup className="mb-2">
            <Form.Control
              id="search-bar"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <div
            style={{
              maxHeight: '150px',
              overflowY: 'scroll',
              border: '1px solid #ccc',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            <ListGroup>
              {filteredOptions.map((option, index) => (
                <ListGroup.Item key={`${option.subclass}-${index}`} className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    id={option.subclass}
                    label={option.label}
                    checked={selectedInstances.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default InstancesDropdown;