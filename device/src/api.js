import axios from "axios";

const resolveBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_DEVICE_API_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  if (import.meta.env.DEV) {
    return "/api";
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5001/api`;
  }
  return "";
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default api;
