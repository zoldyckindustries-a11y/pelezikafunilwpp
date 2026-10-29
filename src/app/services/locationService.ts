import axios from "axios";

export interface LocationData {
  city: string;
  state: string;
  country: string;
}

interface IpApiResponse {
  city?: string;
  region_code?: string;
  region?: string;
  country_name?: string;
}

export async function getUserLocation(): Promise<LocationData> {
  try {
    // Check if we have a stored location
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      return JSON.parse(storedLocation);
    }

    // IP-based geolocation via ipapi.co — free, HTTPS, no API key or billing required
    const { data } = await axios.get<IpApiResponse>("https://ipapi.co/json/", {
      timeout: 6000,
    });

    const locationData: LocationData = {
      city: data.city || "São Paulo",
      state: data.region_code || data.region || "SP",
      country: data.country_name === "Brazil" ? "Brasil" : data.country_name || "Brasil",
    };

    // Store the location in localStorage
    localStorage.setItem("userLocation", JSON.stringify(locationData));

    return locationData;
  } catch (error) {
    console.error("Error getting location:", error);
    // Return default location in case of API error
    const defaultLocation = {
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
    };

    // Store the default location in localStorage
    localStorage.setItem("userLocation", JSON.stringify(defaultLocation));

    return defaultLocation;
  }
}
