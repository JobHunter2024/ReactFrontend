import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./EventSearchPage.css";

interface Event {
  id: number;
  title: string;
  type: string;
  topic: string;
  isOnline: boolean;
  location: string;
  eventURL: string;
  date: string; 
}

type OptionType = { value: string; label: string };

const EventSearchPage: React.FC = () => {
  // State for filters
  const [eventTypes, setEventTypes] = useState<OptionType[]>([]);
  const [topics, setTopics] = useState<OptionType[]>([]);
  const [locations, setLocations] = useState<OptionType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // State for selected filters
  const [selectedTypes, setSelectedTypes] = useState<OptionType[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<OptionType[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<OptionType[]>([]);
  const [selectedIsOnline, setSelectedIsOnline] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const eventsTypesAPI = import.meta.env.VITE_API_EVENTS_TYPES;
  const eventsTopicsAPI = import.meta.env.VITE_API_EVENTS_TOPICS;
  const eventsLocationsAPI = import.meta.env.VITE_API_EVENTS_LOCATIONS;
  const eventsAPI = import.meta.env.VITE_API_EVENTS;

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [typesRes, topicsRes, locationsRes] = await Promise.all([
          axios.get(eventsTypesAPI),
          axios.get(eventsTopicsAPI),
          axios.get(eventsLocationsAPI),
        ]);

        setEventTypes(typesRes.data.map((type: string) => ({ value: type, label: type })));
        setTopics(topicsRes.data.map((topic: string) => ({ value: topic, label: topic })));
        setLocations(locationsRes.data.map((location: string) => ({ value: location, label: location })));
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchFilters();
  }, []);

  // Fetch filtered events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = {
          type: selectedTypes.length > 0 ? selectedTypes.map(t => t.value).join(",") : undefined,
          topics: selectedTopics.length > 0 ? selectedTopics.map(t => t.value).join(",") : undefined,
          locations: selectedLocations.length > 0 ? selectedLocations.map(l => l.value).join(",") : undefined,
          isOnline: selectedIsOnline !== null ? selectedIsOnline : undefined,
          dates: selectedDate || undefined,
        };

        const response = await axios.get(eventsAPI, { params });
        console.log("API Response:", response.data);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [selectedTypes, selectedTopics, selectedLocations, selectedIsOnline, selectedDate]);

  return (
    <div className="event-search-page">

      {/* Filters Section */}
      <div className="filters">
        <h1>Event Search</h1>
        {/* Multi-Select Event Type */}
        <div>
          <label>Type</label>
          <Select
            options={eventTypes}
            isMulti
            value={selectedTypes}
            onChange={(selectedOptions) => 
              setSelectedTypes(selectedOptions ? [...selectedOptions] : [])
            }
          />
        </div>

        {/* Multi-Select Topic */}
        <div>
          <label>Topic</label>
          <Select
            options={topics}
            isMulti
            value={selectedTopics}
            onChange={(selectedOptions) => 
              setSelectedTopics(selectedOptions ? [...selectedOptions] : [])
            }
          />
        </div>

        {/* Multi-Select Location */}
        <div>
          <label>Location</label>
          <Select
            options={locations}
            isMulti
            value={selectedLocations}
            onChange={(selectedOptions) => 
              setSelectedLocations(selectedOptions ? [...selectedOptions] : [])
            }
          />
        </div>

        {/* Online/Offline Filter */}
        <div>
          <label>Online/Onsite</label>
          <select onChange={(e) => setSelectedIsOnline(e.target.value || null)} value={selectedIsOnline || ""}>
            <option value="">All</option>
            <option value="true">Online</option>
            <option value="false">Onsite</option>
          </select>
        </div>

        {/* Date Picker */}
        <div>
          <label>Date</label>
          <input type="date" onChange={(e) => setSelectedDate(e.target.value)} value={selectedDate} />
        </div>
      </div>

      {/* Results Section */}
      <div className="events-list">
        <h2>Filtered Events</h2>
        {events.length === 0 ? (
          <p>No events found with the selected filters.</p>
        ) : (
          <ul>
            {events.map((event,index) => (
              <li key={event.id || `event-${index}`}>
                <h3>{event.title}</h3>
                <p>Type: {event.type} | Topic: {event.topic} | {event.isOnline ? "Online" : "Onsite"} | Location: 
                  {event.location} | Date: {new Date(event.date).toLocaleDateString()} | 
                  <a href={event.eventURL} target="_blank" rel="noopener noreferrer">Go to Event</a></p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventSearchPage;
