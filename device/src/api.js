import axios from "axios";

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_DEVICE_API_URL) {
    return import.meta.env.VITE_DEVICE_API_URL;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5001/api`;
  }
  return "";
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
});

export default api;
