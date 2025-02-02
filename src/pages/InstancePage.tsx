import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { InstanceData, ApiService } from '../service/ApiService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatisticsService from '../service/StatisticsService';
import { JobData, ChartData } from '../service/StatisticsService';
import { getCoordinatesFromAddress } from '../service/LocationService';

const InstancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instanceData, setInstanceData] = useState<InstanceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [pageEntityType, setPageEntityType] = useState<string | null>(null);
  const [jobLocation, setJobLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [skillData, setSkillData] = useState<any>(null); // Added to hold skill data

  const api = new ApiService('http://localhost:8888/api/v1');
  const statisticsApi = new StatisticsService('http://localhost:8888/api/v1');

  const fetchJobData = async (): Promise<JobData[]> => {
    const response = await statisticsApi.getEntityInstances(decodeURIComponent(id || ''));
    return response.map((job: any) => ({
      job: job.job,
      datePosted: job.datePosted.replace(/\"|\^\^xsd:date/g, ""),
      dateRemoved: job.dateRemoved ? job.dateRemoved.replace(/\"|\^\^xsd:date/g, "") : null,
    }));
  };

  const generateChartData = (data: JobData[]): ChartData[] => {
    const dateCounts: Record<string, number> = {};
    const today = new Date().toISOString().split("T")[0];

    data.forEach(({ datePosted, dateRemoved }) => {
      if (datePosted) {
        dateCounts[datePosted] = (dateCounts[datePosted] || 0) + 1;
      }
      if (dateRemoved) {
        dateCounts[dateRemoved] = (dateCounts[dateRemoved] || 0) - 1;
      }
    });

    const sortedDates = Object.keys(dateCounts).sort();
    let runningTotal = 0;
    let jobsRemoved = 0;
    const chartData: ChartData[] = sortedDates.map((date) => {
      runningTotal += dateCounts[date] || 0;
      if (dateCounts[date] < 0) {
        jobsRemoved += Math.abs(dateCounts[date]);
      }
      return { date, availableJobs: runningTotal, removedJobs: jobsRemoved };
    });

    return chartData.filter((entry) => entry.date <= today);
  };

  const getChartData = useMemo(() => {
    const data = generateChartData(jobData);

    if (data.length === 0) {
      return [];
    }

    if (data.length === 1) {
      const today = new Date().toISOString().split("T")[0];
      if (data[0].date !== today) {
        data.push({ date: today, availableJobs: data[0].availableJobs, removedJobs: data[0].removedJobs });
      }
    }

    return data;
  }, [jobData]);

  useEffect(() => {
    const decodedId = decodeURIComponent(id || '');

    const fetchData = async () => {
      try {
        const response = await api.getDataOfInstance(decodedId ?? '');
        setInstanceData(response);

        const instanceOfEntries = response.filter(
          (item) => item.propertyLabel === 'Instance Of'
        );

        const jobUri = 'http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Job';
        const skillUri = 'http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Skill';

        const foundJob = instanceOfEntries.some((item) => item.value === jobUri);
        const foundSkill = instanceOfEntries.some((item) => item.value === skillUri);

        if (foundJob) {
          setPageEntityType('Job');
          console.log("Page Entity Type is Job");
        }
        if (foundSkill) {
          setPageEntityType('Skill');
          console.log("Page Entity Type is Skill");
        }

        if (foundJob || foundSkill) {
          fetchJobData().then(setJobData);
        } else {
          setJobData([]);
        }

        // Get job location string from response
        const locationProperty = response.find(
          (item) => item.property === "http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#jobLocation"
        );

        if (locationProperty) {
          const address = locationProperty.value as string;
          // Call geocoding function to get coordinates
          const coordinates = await getCoordinatesFromAddress(address);
          if (coordinates) {
            setCoordinates(coordinates);
          }
        }

        // Fetch skill data if the page is a Skill
        if (foundSkill) {
          const skillResponse = await api.getSkillData(decodedId); // Assume it uses the API method from ApiService
          setSkillData(skillResponse || null); // Set the skill data
        }
      } catch (err: any) {
        console.error(err);
        setError('Error fetching data');
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    // Clear job data if pageEntityType is not Skill or Job
    if (pageEntityType !== "Skill" && pageEntityType !== "Job") {
      setJobData([]);
    }
  }, [pageEntityType]);

  const chartData = useMemo(() => generateChartData(jobData), [jobData]);

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
      'Skill': 'bg-light text-black',
      'SoftSkill': 'bg-warning text-white',
      'TechnicalSkill': 'bg-purple text-white',
      'LanguageSkill': 'bg-success text-white',
      'ProgrammingLanguage': 'bg-lightgreen text-white',
      'Library': 'bg-danger text-white',
      'Framework': 'bg-info text-white',
      'Event' : 'bg-dark text-white'
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
            <h1>
              {groupedData["http://www.w3.org/2000/01/rdf-schema#label"]?.[0]?.value 
                ? String(groupedData["http://www.w3.org/2000/01/rdf-schema#label"][0].value)
                : "Instance Details"}
            </h1>

            {pageEntityType === "Job" && coordinates && (
              <MapContainer center={coordinates as LatLngExpression} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                <Marker position={coordinates as LatLngExpression}>
                  <Popup>{jobLocation}</Popup>
                </Marker>
              </MapContainer>
            )}

            {pageEntityType === "Skill" && (
              <div style={{ width: '100%' }}>
                {chartData.length === 0 ? (
                  <p>No entries found</p>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line connectNulls type="monotone" dataKey="availableJobs" stroke="#8884d8" name="Available Jobs" />
                      <Line connectNulls type="monotone" dataKey="removedJobs" stroke="#ff4d4d" name="Removed Jobs" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}


            {pageEntityType === "Skill" && skillData && (
              <Row className="mt-3">
                {Object.entries(skillData).map(([key, value]) => (
                    <Card className="mt-3">
                      <Card.Header>
                        {key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
                      </Card.Header>
                      <Card.Body>
                        {key === 'logo_url' && value ? ( // Check if the key is 'logo_url'
                          <img src={value as string} alt="Logo" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                        ) : (
                          <p>{String(value)}</p> // For other keys, display the value as text
                        )}
                      </Card.Body>
                    </Card>
                ))}
              </Row>
            )}

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
                            overlay={<BootstrapTooltip>{instanceOfText}</BootstrapTooltip>}
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
