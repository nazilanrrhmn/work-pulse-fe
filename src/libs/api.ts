import axios from "axios";
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_SERVICE_API_URL;

export const apiV1 = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

apiV1.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
