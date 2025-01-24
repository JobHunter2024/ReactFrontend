import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import MainEntities from '../components/MainEntities';
import { DropdownProvider, useDropdownContext } from '../components/DropdownContext';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const DisplayDataObject: React.FC = () => {
    const { mainDataObject } = useDropdownContext();
    const [isVisible, setIsVisible] = useState(false);

  
    return (
      <div className="mt-4">
        <Button
          variant="primary"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? "Hide JSON Data" : "Show JSON Data"}
        </Button>
        {isVisible && (
          <Card className="mt-3">
            <Card.Header>JSON Format of DataObject</Card.Header>
            <Card.Body>
              <pre>{JSON.stringify(mainDataObject, null, 2)}</pre> {/* Display JSON with 2-space indentation */}
            </Card.Body>
          </Card>
        )}
      </div>
    );
  };

const SearchPage: React.FC = () => {
  return (
    <DropdownProvider>
      <Container fluid className="p-4">
        <Row>
          <Col md={12}>
            <p>Select options from the dropdowns to dynamically filter the available data.</p>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <MainEntities />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <DisplayDataObject /> {/* Display the dataObject in a collapsible element */}
          </Col>
        </Row>
      </Container>
    </DropdownProvider>
  );
};

export default SearchPage;