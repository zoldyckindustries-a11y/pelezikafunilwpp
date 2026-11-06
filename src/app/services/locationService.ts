import axios from "axios";

export interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface IpApiResponse {
  city?: string;
  region_code?: string;
  region?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
}

export async function getUserLocation(): Promise<LocationData> {
  try {
    // Cache anterior à inclusão das coordenadas não serve para o mapa:
    // nesse caso vale refazer a consulta em vez de devolver incompleto.
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      const cached: LocationData = JSON.parse(storedLocation);
      if (typeof cached.latitude === "number") {
        return cached;
      }
    }

    // IP-based geolocation via ipapi.co — free, HTTPS, no API key or billing required
    const { data } = await axios.get<IpApiResponse>("https://ipapi.co/json/", {
      timeout: 6000,
    });

    const locationData: LocationData = {
      city: data.city || "São Paulo",
      state: data.region_code || data.region || "SP",
      country: data.country_name === "Brazil" ? "Brasil" : data.country_name || "Brasil",
      latitude: data.latitude,
      longitude: data.longitude,
    };

    // Store the location in localStorage
    localStorage.setItem("userLocation", JSON.stringify(locationData));

    return locationData;
  } catch (error) {
    console.error("Error getting location:", error);
    // Return default location in case of API error
    const defaultLocation: LocationData = {
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      latitude: -23.5505,
      longitude: -46.6333,
    };

    // Store the default location in localStorage
    localStorage.setItem("userLocation", JSON.stringify(defaultLocation));

    return defaultLocation;
  }
}
