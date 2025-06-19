import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-psi-blond-70.vercel.app/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request untuk debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor dengan retry logic
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      } - ${response.status}`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      {
        status: error.response?.status,
        message: error.message,
        code: error.code,
      }
    );

    // Auto logout untuk 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Retry untuk timeout atau network error
    if (
      (error.code === "ECONNABORTED" || error.code === "NETWORK_ERROR") &&
      !originalRequest._retry &&
      originalRequest._retryCount < 2
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      console.log(`Retrying request... Attempt ${originalRequest._retryCount}`);

      // Wait before retry
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * originalRequest._retryCount)
      );

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;

// Utility functions untuk different endpoints
export const apiWithTimeout = (timeout) => {
  return axios.create({
    ...api.defaults,
    timeout,
  });
};

// Specific API calls dengan timeout yang disesuaikan
export const dashboardAPI = {
  getUsers: () => api.get("/admin/users", { timeout: 30000 }),
  getTransactions: () => api.get("/admin/transactions", { timeout: 30000 }),
  getLocations: () => api.get("/admin/locations", { timeout: 30000 }),
  getDashboard: () => api.get("/admin/dashboard/data", { timeout: 30000 }),
};
