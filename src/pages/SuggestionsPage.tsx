import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import { EntityInstance, Suggestion, ApiService } from '../service/ApiService';

const SuggestionsPage: React.FC = () => {
  const [options, setOptions] = useState<EntityInstance[]>([]);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const api = new ApiService('http://localhost:8888/api/v1');
  const navigate = useNavigate(); // Initialize useNavigate

  const filters = [
    'http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#ProgrammingLanguage',
    'http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Library',
    'http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Framework',
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await api.getFilteredEntityInstances(filters, searchValue);
        setOptions(response);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchEntities();
  }, [searchValue]);

  const handleToggle = (option: string) => {
    setSelectedOption(selectedOption === option ? null : option);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      alert('Please select an option before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.getSuggestions(selectedOption);
      setSuggestions(response);
    } catch (err: any) {
      console.error(err);
    }

    setIsSubmitting(false);
  };

  // Handle click on a response card
  const handleCardClick = (instanceValue: string) => {
    const encodedInstance = encodeURIComponent(instanceValue); // URL encode the instance value
    navigate(`/instance/${encodedInstance}`); // Navigate to the /instance/URLEncodedValue page
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col md={3}>
          <Card>
            <Card.Header>
              <Form.Control
                type="text"
                placeholder="Search options..."
                value={searchValue}
                onChange={handleSearchChange}
              />
            </Card.Header>
            <Card.Body style={{ maxHeight: '250px', overflowY: 'auto', padding: 0 }}>
              <div className="d-flex flex-column p-2">
                {filteredOptions.map((option) => (
                  <Button
                    key={option.subclass}
                    variant={selectedOption === option.subclass ? 'primary' : 'outline-primary'}
                    className="mb-2"
                    onClick={() => handleToggle(option.subclass)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-center">
              <Button
                variant={isSubmitting ? 'success' : 'primary'}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{' '}
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={9} className="d-flex justify-content-center align-items-center">
          {suggestions.length > 0 ? (
            <div className="w-100">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="mb-3" onClick={() => handleCardClick(suggestion.resourceUri)}>
                  <Card.Body>
                    <h5>Intermediate Related Skill</h5>
                    <p>{suggestion.intermediateRelatedSkill}</p>
                    <h5>Intermediate Relation</h5>
                    <p>{suggestion.intermediateRelation}</p>
                    <h5>Related Skill</h5>
                    <p>{suggestion.relatedSkill}</p>
                    <h5>Relation</h5>
                    <p>{suggestion.relation}</p>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center">
              Please select a technology and submit a request.
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SuggestionsPage;
