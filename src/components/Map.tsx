import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import '../components/Map.css';

interface Location {
  companyName: string;
  address: string;
  datePosted: string;
  eventDate: string;
  eventType: string;
  isOnline: any;
  eventURL: any;
  latitude: string;
  longitude: string;
  title: string;
  description: string;
  iri: string;
  type?: 'job' | 'event';
  eventDetails?: {
    date: string;
    isOnline: boolean;
    eventType?: string;
    eventURL: string;
  };
}

interface MapProps {
  locations: Location[];
  showEvents?: boolean;
  onMarkerClick?: (location: Location) => void;
}

const Map: React.FC<MapProps> = ({ locations = [], showEvents = true, onMarkerClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const layerControlRef = useRef<L.Control.Layers | null>(null);

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([44.4268, 26.1025], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Create cluster groups
    const jobMarkers = L.markerClusterGroup({
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });

    const eventMarkers = L.markerClusterGroup({
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });

    // Add markers
    const jitter = () => (Math.random() - 0.5) * 0.0011;

    locations.forEach((location) => {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);

      // Check if latitude and longitude are valid numbers
      if (isNaN(lat) || isNaN(lng)) {
        console.error(`Invalid coordinates for location: ${location.title}`, location);
        return;
      }

      const marker = L.marker([lat + jitter(), lng + jitter()]);

// const popupContent = `
//   <div class="custom-popup">
//     <h5>${location.title || 'N/A'}</h5>
//     <div class="details">
//       ${
//         location.type === 'job' 
//           ? `
//             <p><i class="bi bi-building"></i> ${location.companyName || 'N/A'}</p>
//             <p><i class="bi bi-geo-alt"></i> ${location.address || 'N/A'}</p>
//             <p><i class="bi bi-calendar"></i> Posted: ${location.datePosted || 'N/A'}</p>
//           `
//           : `
//             <p><i class="bi bi-calendar-event"></i> ${location.eventDate || 'N/A'}</p>
//             <p><i class="bi bi-tag"></i> ${location.eventType || 'N/A'}</p>
//             <p><i class="bi bi-geo-alt"></i> ${location.address || 'N/A'}</p>
//             ${location.isOnline ? '<p><i class="bi bi-wifi"></i> Online Event</p>' : ''}
//           `
//       }
//       <div class="mt-2">
//         <button class="btn btn-sm btn-primary" 
//           onclick="${location.type === 'job' 
//             ? `window.location='/instance/${encodeURIComponent(location.iri)}'` 
//             : `window.open('${location.eventURL || '#'}', '_blank')`}">
//           More Details
//         </button>
//         <button class="btn btn-sm btn-secondary" 
//           onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}', '_blank')">
//           Get Directions
//         </button>
//       </div>
//     </div>
//   </div>
// `;
const popupContent = `
  <div class="custom-popup">
    <h5>${location.title || 'N/A'}</h5>
    <div class="details">
      ${
        location.type === 'job' 
          ? `
            <p><i class="bi bi-building"></i> ${location.companyName || 'N/A'}</p>
            <p><i class="bi bi-geo-alt"></i> ${location.address || 'N/A'}</p>
            <p><i class="bi bi-calendar"></i> Posted: ${location.datePosted || 'N/A'}</p>
          `
          : `
            <p><i class="bi bi-calendar-event"></i> Date: ${location.eventDate || 'N/A'}</p>
            <p><i class="bi bi-tag"></i> ${location.eventType || 'N/A'}</p>
            <p><i class="bi bi-geo-alt"></i> ${location.address || 'N/A'}</p>
            ${location.isOnline ? '<p><i class="bi bi-wifi"></i> Online Event</p>' : ''}
          `
      }
      <div class="mt-2">
        <button class="btn btn-sm btn-primary" 
          onclick="${location.type === 'job' 
            ? `window.location='/instance/${encodeURIComponent(location.iri)}'` 
            : `window.open('${location.eventURL || '#'}', '_blank')`}">
          More Details
        </button>
        <button class="btn btn-sm btn-secondary" 
          onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}', '_blank')">
          Get Directions
        </button>
      </div>
    </div>
  </div>
`;
// Add event listener for the button after the popup is opened
marker.on('popupopen', () => {
  document.querySelector(`button[data-iri="${location.iri}"]`)?.addEventListener('click', () => {
    if (onMarkerClick) {
      onMarkerClick(location);
    }
    mapRef.current?.closePopup();
  });
});

      marker.bindPopup(popupContent);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(location));
      }

// Using Leaflet's built-in icon with custom color and shadowUrl
const jobIcon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'blue-marker'
});

const eventIcon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'red-marker'
});

      if (location.type === 'event') {
        marker.setIcon(eventIcon);
        eventMarkers.addLayer(marker);
      } else {
        marker.setIcon(jobIcon);
        jobMarkers.addLayer(marker);
      }
    });

    // Add clusters to map
    map.addLayer(jobMarkers);
    if (showEvents) {
      map.addLayer(eventMarkers);
    }

    // Add layer control
    const overlayMaps = {
      "Jobs": jobMarkers,
      "Events": eventMarkers
    };

    if (layerControlRef.current) {
      layerControlRef.current.remove();
    }
    layerControlRef.current = L.control.layers(undefined, overlayMaps).addTo(map);

    // Add search control
    const searchControl = GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style: 'bar',
      showMarker: false,
      autoClose: true,
    });
    map.addControl(searchControl);

    // Cleanup function
    return () => {
      // Remove layers and controls
      map.removeControl(searchControl);
      jobMarkers.clearLayers();
      eventMarkers.clearLayers();

      if (layerControlRef.current) {
        map.removeControl(layerControlRef.current);
      }

      // Only remove map on component unmount
      if (!mapRef.current) return;
      mapRef.current.remove();
      mapRef.current = null;
    };
  }, [locations, showEvents, onMarkerClick]);

  return <div id="map" style={{ width: "100%", height: "500px" }} />;
};

export default Map;