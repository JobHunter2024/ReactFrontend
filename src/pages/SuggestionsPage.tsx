import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Modal,
} from "react-bootstrap";
import { EntityInstance, Suggestion, ApiService } from "../service/ApiService";
import UserDataService from "../service/UserDataService";
import { technology } from "../service/UserDataService";
import { jwtDecode } from "jwt-decode";
import "../pages/SuggestionsPage.css";

// Interface for decoding JWT payload (based on your JWT structure)
interface JwtPayload {
  id: number;
  username: string;
  email: string;
  exp: number; // expiration timestamp
}

const SuggestionsPage: React.FC = () => {
  const [options, setOptions] = useState<EntityInstance[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<EntityInstance[]>([]);
  const [favourites, setFavourites] = useState<technology[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"add" | "remove" | null>(null);
  const [selectedItem, setSelectedItem] = useState<
    EntityInstance | technology | null
  >(null);
  const [userId, setUserId] = useState<number | null>(null);

  const api = new ApiService("http://localhost:8888/api/v1");
  const userDataApi = new UserDataService("http://localhost:8890/api/v1");
  const navigate = useNavigate();

  const filters = [
    "http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#ProgrammingLanguage",
    "http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Library",
    "http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Framework",
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        setUserId(decodedToken.id);
        fetchFavourites(decodedToken.id);
        setIsAuthenticated(true);
        fetchTechnologies();
      } catch (err) {
        console.error("Invalid token:", err);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchTechnologies = async () => {
    try {
      const response = await api.getFilteredEntityInstances(
        filters,
        searchValue
      );
      setOptions(response);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFavourites = async (userId: number) => {
    try {
      const response = await userDataApi.getAllUserTechnologies(userId);
      setFavourites(response);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // Ensure options are filtered whenever either options or favourites update
  useEffect(() => {
    if (options.length > 0 && favourites.length >= 0) {
      filterOptions();
    }
  }, [options, favourites]);

  const filterOptions = () => {
    const favouriteUris = new Set(favourites.map((fav) => fav.uri));
    const filtered = options.filter(
      (option) => !favouriteUris.has(option.subclass)
    );
    setFilteredOptions(filtered);
  };

  const handleAddToFavourites = async (item: EntityInstance) => {
    try {
      if (userId === null) return;

      const newTechnology: technology = {
        id: undefined,
        name: item.label,
        uri: item.subclass,
        userId: userId, // Use the userId
      };

      await userDataApi.addUserTechnology(newTechnology);
      fetchFavourites(userId); // Refresh favourites
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFromFavourites = async (item: technology) => {
    try {
      if (userId === null) return;

      await userDataApi.removeUserTechnology(item);
      fetchFavourites(userId); // Refresh favourites
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = (instanceValue: string) => {
    const encodedInstance = encodeURIComponent(instanceValue);
    navigate(`/instance/${encodedInstance}`);
  };

  const openModal = (
    action: "add" | "remove",
    item: EntityInstance | technology
  ) => {
    setModalAction(action);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalAction(null);
  };

  const confirmAction = () => {
    if (modalAction === "add" && selectedItem && "subclass" in selectedItem) {
      handleAddToFavourites(selectedItem);
    } else if (
      modalAction === "remove" &&
      selectedItem &&
      "id" in selectedItem
    ) {
      handleRemoveFromFavourites(selectedItem);
    }
    closeModal();
  };

  const handleGenerateSuggestions = async () => {
    try {
      setIsSubmitting(true);
      const uris: string[] = favourites.map((fav) => fav.uri);

      const response = await api.getSuggestions(uris[0]);
      setSuggestions(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container
        fluid
        className="p-4 d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <h3>Please login in order to use this feature.</h3>
      </Container>
    );
  }

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
            <Card.Body
              style={{ maxHeight: "250px", overflowY: "auto", padding: 0 }}
            >
              <div className="d-flex flex-column p-2">
                {filteredOptions.map((option) => (
                  <Button
                    key={option.subclass}
                    variant="outline-primary"
                    className="mb-2"
                    onClick={() => openModal("add", option)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          <br></br>

          <Card>
            <Card.Header>Favourite Technologies</Card.Header>
            <Card.Body
              style={{ maxHeight: "250px", overflowY: "auto", padding: 0 }}
            >
              <div className="d-flex flex-column p-2">
                {favourites.map((fav) => (
                  <Button
                    key={fav.id}
                    variant="outline-danger"
                    className="mb-2"
                    onClick={() => openModal("remove", fav)}
                  >
                    {fav.name}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Button
            variant="primary"
            onClick={handleGenerateSuggestions}
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
                />{" "}
                Generating Suggestions...
              </>
            ) : (
              "Generate Suggestions"
            )}
          </Button>

          <div className="mt-4">
            {suggestions.length > 0 && (
              <div className="w-100">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="mb-3"
                    onClick={() => handleCardClick(suggestion.resourceUri)}
                  >
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
            )}
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalAction === "add" && selectedItem && "label" in selectedItem
            ? `Are you sure you want to add ${selectedItem.label} to your favourites?`
            : modalAction === "remove" && selectedItem && "name" in selectedItem
            ? `Are you sure you want to remove ${selectedItem.name} from your favourites?`
            : ""}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmAction}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SuggestionsPage;
