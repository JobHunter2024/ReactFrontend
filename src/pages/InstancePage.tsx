import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
        setInstanceData(response);
      } catch (err: any) {
        console.error(err);
        setError('Error fetching data');
      }
    };

    fetchData();
  }, [id]);

  const displayValue = (value: string) => {
    return value
      .replace(/^"/, '') // Remove leading quote
      .replace(/"\^\^xsd:.*/, '') // Remove trailing ^^xsd:* suffix
      .replace('http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#', '');
  };

  const formatCamelCase = (str: string) => {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (match) => match.toUpperCase());
  };

  const groupedData = instanceData.reduce((acc, item) => {
    const key = item.property;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, InstanceData[]>);

  const handleCardClick = (instanceValue: string) => {
    const encodedInstance = encodeURIComponent(instanceValue);
    navigate(`/instance/${encodedInstance}`);
  };

  const getButtonStyle = (instanceOfValues: string) => {
    const ontologyColors: Record<string, string> = {
      'Skill': 'bg-dark text-white',
      'SoftSkill': 'bg-warning text-white',
      'TechnicalSkill': 'bg-purple text-white',
      'LanguageSkill': 'bg-success text-white',
      'ProgrammingLanguage': 'bg-lightgreen text-white',
      'Library': 'bg-danger text-white',
      'Framework': 'bg-info text-white',
    };

    const instanceTypes = instanceOfValues.split(', ').map((val) => displayValue(val));
    for (const type of Object.keys(ontologyColors).reverse()) {
      if (instanceTypes.includes(type)) {
        return ontologyColors[type];
      }
    }
    return 'bg-white text-black';
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
                  formatCamelCase(displayValue(property));

                return (
                  <Card className="mt-3" key={property}>
                    <Card.Header>{label}</Card.Header>
                    <Card.Body>
                      {items.map((item, index) => {
                        if (!item.instanceOfValues) {
                          return <p key={index}>{displayValue(item.value as string)}</p>;
                        }

                        const instanceOfText = item.instanceOfValues
                          .split(', ')
                          .map((val) => displayValue(val))
                          .join(', ');

                        return (
                          <OverlayTrigger
                            key={index}
                            placement="top"
                            overlay={<Tooltip>{instanceOfText}</Tooltip>}
                          >
                            <Button
                              className={`rounded-pill m-1 ${getButtonStyle(item.instanceOfValues)}`}
                              onClick={() => handleCardClick(item.value as string)}
                            >
                              {displayValue(item.value as string)}
                            </Button>
                          </OverlayTrigger>
                        );
                      })}
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
