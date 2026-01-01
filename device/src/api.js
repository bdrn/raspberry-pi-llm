import axios from "axios";

const api = axios.create({
  baseURL: "http://172.20.10.2:5001/api",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default api;
