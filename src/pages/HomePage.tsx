import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { EntityInstance, ApiService } from '../service/ApiService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [entityInstances, setEntityInstances] = useState<EntityInstance[]>([]);
  const [error, setError] = useState<string | null>(null);

  const api = new ApiService('http://localhost:8888/api/v1');

  useEffect(() => {
    const fetchEntityInstances = async () => {
      try {
        const response = await api.getFilteredEntityInstances(["http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Job"], ""); 
        setEntityInstances(response); // Set the entity instances data here
      } catch (err: any) {
        console.error(err);
        setError('Error fetching data'); // Handle error
      }
    };

    fetchEntityInstances();
  }, []);

  // Handle click on a response card
  const handleCardClick = (subclass: string) => {
    const encodedSubclass = encodeURIComponent(subclass); // URL encode the subclass value
    navigate(`/instance/${encodedSubclass}`); // Navigate to the /instance/URLEncodedValue page
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h1>Most recent Job Offers</h1>
        </Col>
      </Row>
      {error ? (
        <Row>
          <Col>
            <Card className="mt-3">
              <Card.Header>Error</Card.Header>
              <Card.Body>
                <p>{error}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row>
          {entityInstances.map((instance) => (
            <Col md={4} key={instance.subclass}>
              <Card className="mt-3" onClick={() => handleCardClick(instance.subclass)}>
                <Card.Header>{instance.label}</Card.Header>
                <Card.Body>
                  <p>{instance.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default HomePage;
