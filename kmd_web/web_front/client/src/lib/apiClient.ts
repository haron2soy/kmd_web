import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized");
    }
    return Promise.reject(error);
  }
);

export default apiClient;