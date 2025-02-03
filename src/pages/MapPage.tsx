import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Tabs, Tab } from 'react-bootstrap'; // Removed Badge (not used)
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Map from '../components/Map';
import '../pages/MapPage.css';

interface Coordinates {
  lat: string;
  lng: string;
  address: string;
}

interface BaseLocation {
  coordinates?: Coordinates; // Make coordinates optional
  type: 'job' | 'event';
}

interface JobLocation extends BaseLocation {
  jobTitle?: { value: string }; // Optional value property
  companyName?: { value: string }; // Optional value property
  employmentType?: { value: string };
  experienceLevel?: { value: string };
  jobLocationType?: { value: string };
  datePosted?: { value: string };
  jobIRI: string;
  type: 'job';
}

interface EventLocation extends BaseLocation {
  eventTitle?: { value: string }; // Optional value property
  eventDate?: { value: string };
  isOnline?: { value: boolean };
  //isfromromania
  isFromRomania?: { value: boolean };
  eventType?: { value: string };
  eventURL: string;
  topic?: { value: string };
  city?: string;
  relatedJobs?: Array<{
    jobIRI: string;
    title: string;
    company: string;
  }>;
  type: 'event';
}

type MapLocation = JobLocation | EventLocation;

interface EntityInstance {
  subclass: string;
  label: string;
  description: string;
  iri: string;
  type: 'job' | 'event';
  datePosted?: string;
  eventDate?: string;
  eventURL?: string;
  topic?: string;
  relatedJobs?: Array<{
    jobIRI: string;
    title: string;
    company: string;
  }>;
}

interface Filters {
  employmentType: string;
  experienceLevel: string;
  jobLocationType: string;
  dateRange: string;
  eventType: string;
  showRomaniaEvents: boolean;
}

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jobs');
  const [entityInstances, setEntityInstances] = useState<EntityInstance[]>([]);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    employmentType: '',
    experienceLevel: '',
    jobLocationType: '',
    dateRange: 'all',
    eventType: '',
    showRomaniaEvents: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          employmentType: filters.employmentType || undefined,
          experienceLevel: filters.experienceLevel || undefined,
          jobLocationType: filters.jobLocationType || undefined,
          dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
        };

        const [jobsResponse, eventsResponse] = await Promise.all([
          axios.get("http://localhost:8000/api/map-data", { params }),
          axios.get("http://localhost:8000/api/events-map-data")
        ]);

        const jobLocations = jobsResponse.data
          .filter((job: any) => job.coordinates?.lat && job.coordinates?.lng && job.coordinates?.address) // Check for coordinates AND address
          .map((job: any) => ({
            coordinates: job.coordinates, // Keep the whole coordinates object
            jobTitle: job.jobTitle, // Keep the whole jobTitle object
            companyName: job.companyName, // Keep the whole companyName object
            employmentType: job.employmentType,
            experienceLevel: job.experienceLevel,
            jobLocationType: job.jobLocationType,
            datePosted: job.datePosted,
            jobIRI: job.jobIRI,
            type: 'job',
          }));

        const eventLocations = eventsResponse.data
          .filter((event: any) =>
            event.coordinates?.lat &&
            event.coordinates?.lng &&
            event.coordinates?.address && // Check for address
            (filters.showRomaniaEvents || !event.isFromRomania?.value) &&
            (!filters.eventType || event.eventType?.value === filters.eventType)
          )
          .map((event: any) => ({
            coordinates: event.coordinates, // Keep the whole coordinates object
            eventTitle: event.eventTitle, // Keep the whole eventTitle object
            eventDate: event.eventDate,
            isOnline: event.isOnline,
            eventType: event.eventType,
            eventURL: event.eventURL.value,
            topic: event.topic,
            type: 'event',
            eventDetails: {
              date: event.eventDate?.value, // Access the .value property here if necessary
              isOnline: event.isOnline?.value || false,
              eventType: event.eventType?.value,
              eventURL: event.eventURL.value,
            },
          }));

        setLocations([...jobLocations, ...eventLocations]);

        const transformedInstances = [
          ...jobLocations.map((job: JobLocation) => ({
            subclass: job.jobTitle?.value || 'Unknown Job',  // Check for undefined value
            label: job.jobTitle?.value || 'Unknown Job',   // Check for undefined value
            description: `${job.companyName?.value || 'Unknown Company'} - ${job.coordinates?.address || 'Unknown Address'}`,  // Check for undefined properties
            iri: job.jobIRI,
            datePosted: job.datePosted?.value,
            type: 'job' as const
          })),
          ...eventLocations.map((event: EventLocation) => ({
            subclass: event.eventTitle?.value || 'Unknown Event', // Check for undefined value
            label: event.eventTitle?.value || 'Unknown Event',  // Check for undefined value
            description: `${event.coordinates?.address || 'Unknown Address'} - ${event.eventType?.value || 'Event'}`,  // Check for undefined properties
            iri: event.eventURL,
            eventDate: event.eventDate?.value,
            type: 'event' as const,
            topic: event.topic?.value,
            relatedJobs: event.relatedJobs
          }))
        ];

        setEntityInstances(transformedInstances);
        setError(null);

      } catch (err) {
        console.error(err);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleMapMarkerClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleCardClick = (instance: EntityInstance) => {
    if (instance.type === 'event') {
      navigate(instance.iri); // Navighează direct la URL-ul evenimentului
    } else {
      const path = instance.type === 'job' ? 'instance' : 'event';
      const encodedIRI = encodeURIComponent(instance.iri);
      navigate(`/${path}/${encodedIRI}`);
    }
  };
  
  const formatDate = (dateString: string | undefined) => {  
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return 'Unknown date';
  
    // Option for full date formatting
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container fluid className="map-page-container" vocab="https://schema.org/">
      <Row>
        <Col lg={8}>
          <h2 className="page-title">IT Jobs and Tech Events onsite in Romania</h2>

          <div className="filter-panel mb-4">
            <div className="d-flex gap-3 flex-wrap">
              {activeTab === 'jobs' ? (
                <>
                  {/* <select
                    className="form-select filter-select"
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  >
                    <option value="">All experience levels</option>
                    <option value="Entry">Entry-level</option>
                    <option value="Mid">Intermediate</option>
                    <option value="Senior">Senior</option>
                  </select> */}

                  <select
                    className="form-select filter-select"
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="all">All dates</option>
                    <option value="lastWeek">Last week</option>
                    <option value="lastMonth">Last month</option>
                    <option value="last3Months">Last 3 months</option>
                    <option value="lastYear">Last year</option>
                  </select>
                </>
              ) : (
                <>
                  <select
                    className="form-select filter-select"
                    value={filters.eventType}
                    onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                  >
                    <option value="">All event types</option>
                    <option value="Conference">Conference</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                  </select>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="showRoaniaEvents"
                      checked={filters.showRomaniaEvents}
                      onChange={(e) => setFilters(prev => ({ ...prev, showRomaniaEvents: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="showRomaniaEvents">
                      Show events from Romania only
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="map-container">
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading map...</p>
              </div>
            ) : (
              <Map
              // În cadrul mapării locațiilor
                  locations={locations.filter(loc => loc.coordinates).map(loc => ({
                    latitude: loc.coordinates!.lat,
                    longitude: loc.coordinates!.lng,
                    title: loc.type === 'job' 
                      ? loc.jobTitle?.value || "N/A" 
                      : loc.eventTitle?.value || "N/A",
                    companyName: loc.type === 'job' ? loc.companyName?.value : undefined,
                    address: loc.coordinates?.address || "N/A",
                    datePosted: loc.type === 'job' ? formatDate(loc.datePosted?.value) : undefined,
                    iri: loc.type === 'job' ? loc.jobIRI : loc.eventURL,
                    type: loc.type,
                    eventDate: loc.type === 'event' ? formatDate(loc.eventDate?.value) : undefined,
                    eventType: loc.type === 'event' ? loc.eventType?.value : undefined,
                    isOnline: loc.type === 'event' ? loc.isOnline?.value : undefined,
                    eventURL: loc.type === 'event' ? loc.eventURL : undefined,
                  }))
                }
                showEvents={activeTab === 'events'}
                onMarkerClick={(location) => {
                  const originalLocation = locations.find(l =>
                    l.type === location.type &&
                    (l.type === 'job' ? l.jobIRI === location.iri : l.eventURL === location.eventDetails?.eventURL)
                  );
                  if (originalLocation) {
                    setSelectedLocation(originalLocation);
                  }
                }}
              />
            )}
          </div>

        </Col>

        <Col lg={4} className="sidebar-container">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => k && setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="jobs" title={`Jobs (${locations.filter(l => l.type === 'job').length})`}>
              <div className="job-cards">
                {entityInstances
                  .filter(instance => instance.type === 'job')
                  .map((instance) => (
                    <Card
                      key={instance.iri}
                      className="listing-card mb-3 cursor-pointer"
                      onClick={() => handleCardClick(instance)}
                    >
                      <Card.Header>{instance.label}</Card.Header>
                      <Card.Body>
                        <p>{instance.description}</p>
                        {instance.datePosted && (
                          <p className="text-muted">
                            Posted: {formatDate(instance.datePosted)}
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
              </div>
            </Tab>
            <Tab eventKey="events" title={`Events (${locations.filter(l => l.type === 'event').length})`}>
              <div className="event-cards">
                {entityInstances
                  .filter(instance => instance.type === 'event')
                  .map((instance) => (
                    <Card
                      key={instance.iri}
                      className="listing-card mb-3 cursor-pointer"
                      onClick={() => handleCardClick(instance)}
                    >
                      <Card.Header>{instance.label}</Card.Header>
                      <Card.Body>
                        <p>{instance.description}</p>
                        {instance.eventDate && (
                          <p className="text-muted">
                            Date: {formatDate(instance.eventDate)}
                          </p>
                        )}
                        {instance.topic && (
                          <p className="text-muted">
                            Topic: {instance.topic}
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default MapPage;