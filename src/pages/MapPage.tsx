import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Map from '../components/Map';

// Define the JobLocation interface
interface JobLocation {
  jobTitle: {
    value: string;
  };
  companyName: {
    value: string;
  };
  coordinates: {
    lat: string;
    lng: string;
    address: string;
  };
  employmentType: string;  // New field for employment type
  experienceLevel: string; // New field for experience level
}

// Define the EntityInstance interface
interface EntityInstance {
  subclass: string;
  label: string;
  description: string;
}

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [entityInstances, setEntityInstances] = useState<EntityInstance[]>([]);
  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<JobLocation | null>(null);

  // Filters state
  const [filters, setFilters] = useState({
    employmentType: '',
    experienceLevel: '',
    dateRange: 'lastMonth',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch map locations
        const mapResponse = await axios.get("http://localhost:8000/api/map-data");

        // Filter locations based on filters
        const filteredLocations = mapResponse.data.filter((job: any) => {
          return (
            (!filters.employmentType || job.employmentType === filters.employmentType) &&
            (!filters.experienceLevel || job.experienceLevel === filters.experienceLevel) &&
            job.coordinates?.lat && job.coordinates?.lng
          );
        });

        setLocations(filteredLocations);

        // Transform data for displaying cards
        const transformedJobs = filteredLocations.map((job: any) => ({
          subclass: job.jobTitle.value,
          label: job.jobTitle.value,
          description: `${job.companyName.value} - ${job.coordinates.address}`,
          iri: job.jobIRI.value,
        }));

        setEntityInstances(transformedJobs);
      } catch (err: any) {
        console.error(err);
        setError('Eroare la încărcarea datelor');
      }
    };

    fetchData();
  }, [filters]); // Re-fetch when filters change

  const handleMapMarkerClick = (location: JobLocation) => {
    setSelectedLocation(location);
  };

  const handleCardClick = (job: string) => {
    const encodedJob = encodeURIComponent(job);
    navigate(`/instance/${encodedJob}`);
  };

  // Handle filter change
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <Container fluid className="p-4" vocab="https://schema.org/">
      <Row>
        <Col>
          <h2>Joburi din Romania</h2>
          
          {/* Filter Panel */}
          <div className="filter-panel mb-4">
            <h4>Filters</h4>
            <div className="d-flex gap-3">
              <select
                className="form-select"
                onChange={(e) => handleFilterChange('employmentType', e.target.value)}
              >
                <option value="">All Employment Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>

              <select
                className="form-select"
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              >
                <option value="">All Experience Levels</option>
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>

          <Map
            locations={locations.map((loc) => ({
              latitude: loc.coordinates.lat,
              longitude: loc.coordinates.lng,
              title: loc.jobTitle.value,
              description: `${loc.companyName.value} - ${loc.coordinates.address}`,
              iri: loc.jobIRI,
            }))}
            onMarkerClick={(location) => handleMapMarkerClick(location as JobLocation)}
          />
        </Col>
      </Row>

      {selectedLocation && (
        <Row className="mt-3">
          <Col>
            <Card typeof="JobPosting">
              <Card.Header>Detalii Job</Card.Header>
              <Card.Body>
                <h4 property="title">{selectedLocation.jobTitle.value}</h4>
                <p property="hiringOrganization" typeof="Organization">
                  <span property="name">Company: {selectedLocation.companyName.value}</span></p>
                <p property="jobLocation" typeof="Place">
                  <span property="address">Address: {selectedLocation.coordinates.address}</span></p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleCardClick(selectedLocation.jobTitle.value)}
                >
                  Detalii Job
                </button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mt-5">
        <Col>
          <h1>Joburi Recente ({locations.length})</h1>
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
              <Card
                className="mt-3"
                onClick={() => handleCardClick(instance.subclass)}
              >
                <Card.Header>{instance.label}</Card.Header>
                <Card.Body>
                  <div dangerouslySetInnerHTML={{ __html: instance.description }} />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MapPage;
