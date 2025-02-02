import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ApiService, Job } from '../service/ApiService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  const api = new ApiService('http://localhost:8888/api/v1');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.getJobs();
        console.log(response)
        setJobs(response);
      } catch (err: any) {
        console.error(err);
        setError('Error fetching jobs');
      }
    };

    fetchJobs();
  }, []);

  const displayValue = (value: string) => {
    return value
      .replace(/^"/, '') // Remove leading quote
      .replace(/"\^\^xsd:.*/, '') // Remove trailing ^^xsd:* suffix
      .replace('http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#', '');
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
    return 'bg-black text-white';
  };

  const parseSkills = (relatedSkills: string | null | undefined) => {
    if (!relatedSkills) return []; // Handle null, undefined, or empty values safely
    
    return relatedSkills.split(',').map(skillPair => {
      const [skillURI, skillTypeURI] = skillPair.trim().split('|');
      const skillName = skillURI.split('#').pop() || 'Unknown';
      const skillType = skillTypeURI?.split('#').pop() || 'Unknown';
      return { skillName, skillType };
    });
  };

  const handleCardClick = (job: string) => {
    const encodedJob = encodeURIComponent(job);
    navigate(`/instance/${encodedJob}`);
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h1>Most Recent Job Offers</h1>
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
          {jobs
            .filter((job) => job.label && job.label.trim() !== "")
            .map((job) => {
              const isRemoved = job.dateRemoved;
              const skills = parseSkills(job.relatedSkills);

              return (
                <Col md={4} key={job.job}>
                  <Card 
                    className="mt-3" 
                    onClick={() => handleCardClick(job.job)}
                    border={isRemoved ? 'danger' : 'primary' }
                    style={{ borderWidth: '3px', cursor: 'pointer' }} // Thicker border, pointer cursor
                  >
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h3>{job.label}</h3>
                      <Badge bg={isRemoved ? 'danger' : 'primary' }>
                        {!isRemoved ? 'Available' : 'Unavailable'}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <p><strong>Technical Skills :</strong></p>
                        <br></br>
                        <div>
                          {skills.map(({ skillName, skillType }) => (
                            <OverlayTrigger
                              key={skillName}
                              placement="top"
                              overlay={<Tooltip>{skillType}</Tooltip>}
                            >
                              <Button 
                                className={`rounded-pill m-1 ${getButtonStyle(skillType)}`} 
                              >
                                {skillName}
                              </Button>
                            </OverlayTrigger>
                          ))}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
        </Row>
      )}
    </Container>
  );
};

export default HomePage;