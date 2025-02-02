import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
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

const InstancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instanceData, setInstanceData] = useState<InstanceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [pageEntityType, setpageEntityType] = useState<string | null>(null);

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

        // Find the "Instance Of" properties
        const instanceOfEntries = response.filter(
          (item) => item.propertyLabel === 'Instance Of'
        );

        // Check if it matches "Company" or "Skill"
        const companyUri = 'http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Company';
        const skillUri = 'http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Skill';

        const foundCompany = instanceOfEntries.some((item) => item.value === companyUri);
        const foundSkill = instanceOfEntries.some((item) => item.value === skillUri);

        if (foundCompany) {
          setpageEntityType('Company');
          console.log("Page Entity Type is Company");
        }
        if (foundSkill) {
          setpageEntityType('Skill');
          console.log("Page Entity Type is Skill");
        }

        // Fetch job data if found "Skill" or "Company"
        if (foundCompany || foundSkill) {
          fetchJobData().then(setJobData);
        } else {
          setJobData([]); // Clear job data if not Skill or Company
        }
      } catch (err: any) {
        console.error(err);
        setError('Error fetching data');
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    // Clear job data if pageEntityType is not Skill or Company
    if (pageEntityType !== "Skill" && pageEntityType !== "Company") {
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
            <h1>Instance Details</h1>
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
