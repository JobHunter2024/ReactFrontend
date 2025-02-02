import axios from 'axios';

// Function to geocode the address to coordinates
export const getCoordinatesFromAddress = async (address: string) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    // Check if we got results from Nominatim
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      return { lat, lng };
    } else {
      console.error("Geocoding failed. No results found.");
      return null;
    }
  } catch (error) {
    console.error("Error in geocoding request:", error);
    return null;
  }
};