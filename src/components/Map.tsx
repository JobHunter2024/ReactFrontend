import React, { useEffect } from "react";
import L from "leaflet";
L.Icon.Default.imagePath = "https://unpkg.com/leaflet/dist/images/";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/leaflet.markercluster";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

const provider = new OpenStreetMapProvider();

// Interfața pentru locații
interface Location {
  latitude: string; // Latitude este definită ca string
  longitude: string; // Longitude este definită ca string
  title: string;
  description: string;
  iri:string;
}

interface MapProps {
  locations: Location[];
}

const Map: React.FC<MapProps> = ({ locations }) => {
  useEffect(() => {
    // Inițializează harta centrată pe România
    const map = L.map("map").setView([44.4268, 26.1025], 6);

    // Adaugă stratul OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Creează un grup de clustere
    //const markers = L.markerClusterGroup();

    const markers = L.markerClusterGroup({
      maxClusterRadius: 80, // Raza maximă a clusterului (în pixeli)
      spiderfyOnMaxZoom: true, // Permite "spiderfying" markerii la zoom maxim
      showCoverageOnHover: false, // Dezactivează afișarea zonei de acoperire la hover
      zoomToBoundsOnClick: true, // Zoom automat la cluster la clic
    });
    // Adaugă markerele din array în grupul de clustere
    
    const jitter = () => (Math.random() - 0.5) * 0.0011; // Adaugă o mică variație
    locations.forEach((location) => {
      const marker = L.marker([
        parseFloat(location.latitude) + jitter(),
        parseFloat(location.longitude) + jitter(),
      ]);

      // Crează un popup personalizat cu detalii
      const popupContent = `
        <div style="text-align: center;">
          <h3>${location.title}</h3>
          <p><strong>Companie:</strong> ${location.description.split(" - ")[0]}</p>
          <p><strong>Adresă:</strong> ${location.description.split(" - ")[1]}</p>
          <a href="/instance/${encodeURIComponent(location.iri)}" target="_blank" style="color: blue; text-decoration: underline;">Vezi detalii</a>
        </div>
      `;

      // Atașează popup-ul la marker
      marker.bindPopup(popupContent);

      // Adaugă markerul în grupul de clustere
      markers.addLayer(marker);
    });

    // Adaugă grupul de clustere pe hartă
    map.addLayer(markers);

    // Adaugă search control
  const searchControl = GeoSearchControl({
    provider: provider,
    style: 'bar', // Stilul barei de căutare
    showMarker: true, // Arată markerul la locația găsită
    autoClose: true, // Închide rezultatele după selectare
    searchLabel: 'Caută locație', // Text placeholder
    keepResult: true, // Păstrează rezultatul căutării
  });

  // Adaugă controlul de căutare pe hartă
  map.addControl(searchControl);

  // Curăță harta și controlul de căutare la demontarea componentei
  return () => {
    map.removeControl(searchControl);
    map.remove();
  };
   
  }, [locations]);

  return <div id="map" style={{ width: "100%", height: "500px" }}></div>;
};

export default Map;
