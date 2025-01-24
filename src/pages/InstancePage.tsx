import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { InstanceData, ApiService } from '../service/ApiService';

const InstancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instanceData, setInstanceData] = useState<InstanceData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const api = new ApiService('http://localhost:8888/api/v1');

  useEffect(() => {
    const decodedId = decodeURIComponent(id || '');

    const fetchData = async () => {
      try {
        const response = await api.getDataOfInstance(decodedId ?? '');
        setInstanceData(response); // Set the instance data here
      } catch (err: any) {
        console.error(err);
        setError('Error fetching data'); // Handle error
      }
    };

    fetchData();
  }, [id]);

  const isOntologyUri = (value: string) =>
    value.startsWith('http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology');

  const displayValue = (value: string) => {
    if (isOntologyUri(value)) {
      return value.replace('http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#', '');
    }
    return value;
  };

  // Transform camelCase or PascalCase to a formatted string
  const formatCamelCase = (str: string) => {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (match) => match.toUpperCase());
  };

  // Group by `property` field
  const groupedData = instanceData.reduce((acc, item) => {
    const key = item.property; // Group by `property` field
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, InstanceData[]>);

  const handleCardClick = (instanceValue: string) => {
    const encodedInstance = encodeURIComponent(instanceValue); // URL encode the instance value
    navigate(`/instance/${encodedInstance}`); // Navigate to the /instance/URLEncodedValue page
  };

  return (
    <Container fluid className="p-4">
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
          <Col>
            <h1>Instance Details</h1>
            {Object.keys(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([property, items]) => {
                const label =
                  items[0].propertyLabel ||
                  formatCamelCase(displayValue(property)); // Use label if available, otherwise formatted property

                return (
                  <Card className="mt-3" key={property}>
                    <Card.Header>{label}</Card.Header>
                    <Card.Body>
                      {items.map((item, index) => (
                        <p key={index}>
                          {isOntologyUri(item.value as string) ? (
                            <a href="#" onClick={() => handleCardClick(item.value as string)}>
                              {displayValue(item.value as string)}
                            </a>
                          ) : (
                            item.value.toString()
                          )}
                        </p>
                      ))}
                    </Card.Body>
                  </Card>
                );
              })
            ) : (
              <p>Loading...</p>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default InstancePage;
