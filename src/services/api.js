import axios from "axios";

// Ambil token dari localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

const api = axios.create({
  baseURL: "https://payungku-backend.vercel.app/",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
