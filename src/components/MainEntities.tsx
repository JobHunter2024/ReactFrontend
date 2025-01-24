import React, { useEffect, useState } from 'react';
import PropertyDropdown from './PropertyDropdown';
import { useDropdownContext } from './DropdownContext';
import InstancesDropdown from './InstancesDropdown';
import { Entity, Subclass, ApiService } from '../service/ApiService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

const MainEntities: React.FC = () => {
  
  const { mainDataObject, setMainDataObject } = useDropdownContext();
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [selectedSubclasses, setSelectedSubclasses] = useState<string[]>([]);
  const [propertyDropdowns, setPropertyDropdowns] = useState<{ id: number }[]>([]);
  const [dropdownCounter, setDropdownCounter] = useState(0);

  const [entities, setEntities] = useState<Entity[]>([]);
  const [subclasses, setSubclasses] = useState<Subclass[]>([]);
  const [responseData, setResponseData] = useState<Array<Record<string, any>> | null>(null);

  const api = new ApiService('http://localhost:8888/api/v1');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await api.getEntities();
        setEntities(response);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchEntities();
  }, []);

  useEffect(() => {
    const fetchSubclasses = async () => {
      try {
        const response = await api.getSubclasses(selectedEntity ?? '');
        const filteredSubclasses = response.filter((subclass: Subclass) => subclass.subclass !== selectedEntity);

        setSubclasses(filteredSubclasses);
      } catch (err: any) {
        console.error(err);
      }
    };
    if (selectedEntity) {
      fetchSubclasses();
    }
  }, [selectedEntity]);

  const handleMainSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;

    setMainDataObject({
      subject: selectedValue,
      instances: [],
      dataProperties: {},
      objectProperties: {},
    });

    setSelectedEntity(selectedValue || null);
    setSelectedSubclasses([]);
    setPropertyDropdowns([]);
    setDropdownCounter(0);
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

  const handleSubclassSelection = (event: React.ChangeEvent<HTMLInputElement>, subclass: Subclass) => {
    const isChecked = event.target.checked;
    setSelectedSubclasses((prev) =>
      isChecked ? [...prev, subclass.subclass] : prev.filter((item) => item !== subclass.subclass)
    );
  };

  const handleSubmit = async () => {
    try {
      const response = await api.executeQuery(mainDataObject);
      setResponseData(response); // Store response in state
      console.log('Submission successful:', response);
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  // Handle click on a response card
  const handleCardClick = (instanceValue: string) => {
    const encodedInstance = encodeURIComponent(instanceValue); // URL encode the instance value
    navigate(`/instance/${encodedInstance}`); // Navigate to the /instance/URLEncodedValue page
  };

  const handleReset = () => {
    setMainDataObject({
      subject: "",
      instances: [],
      dataProperties: {},
      objectProperties: {},
    });
    setSelectedEntity(""); // Reset the selected entity (dropdown to default)
    setSelectedSubclasses([]); // Reset the subclasses
    setPropertyDropdowns([]); // Clear property dropdowns
    setDropdownCounter(0); // Reset dropdown counter
    setResponseData(null); // Clear response data
  };

  return (
    <div className="container mt-4">
      <Form.Group className="mb-3">
        <Form.Label>Select Entity:</Form.Label>
        <Form.Select
          id="main-dropdown"
          onChange={handleMainSelection}
          value={selectedEntity ?? ""}
        >
          <option value="">-- Select an Entity --</option>
          {entities.map((option) => (
            <option key={option.class} value={option.class}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

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

      {selectedEntity && (
        <>
          <InstancesDropdown
            selectedEntity={selectedEntity}
            key={selectedEntity}
            selectedSubclasses={selectedSubclasses ?? [selectedEntity]}
            elementOffsetPath={[]}
          />

          <Button variant="primary" className="mt-3" onClick={handleAddDropdown}>
            Add Property Dropdown
          </Button>
        </>
      )}

      {propertyDropdowns.map(({ id }) => (
        <Card key={id} className="mt-3">
          <Card.Body>
            <PropertyDropdown
              selectedEntity={selectedEntity}
              dropdownId={id}
              onRemove={handleRemoveDropdown}
              elementOffsetPath={[]}
            />
          </Card.Body>
        </Card>
      ))}

      {/* Submit Button */}
      <div className="mt-4">
        <Button variant="success" onClick={handleSubmit}>
          Submit Data
        </Button>
      </div>

      {/* Reset Button */}
      <div className="mt-4">
        <Button variant="danger" onClick={handleReset}>
          Reset Page
        </Button>
      </div>

       {/* Response Cards */}
        {responseData && (
          <div className="mt-4">
            {[...new Map(responseData.map((item) => [item.instance, item])).values()].map((uniqueItem, index) => (
              <Card key={uniqueItem.instance} className="mb-3" onClick={() => handleCardClick(uniqueItem.instance)}>
                <Card.Body>
                  {Object.entries(uniqueItem).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {value ?? 'N/A'}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
};

export default MainEntities;
