import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const getToken = () =>
  localStorage.getItem("medlink_token") || sessionStorage.getItem("medlink_token");
const getRefreshToken = () =>
  localStorage.getItem("medlink_refresh_token") || sessionStorage.getItem("medlink_refresh_token");

function clearTokens() {
  localStorage.removeItem("medlink_token");
  localStorage.removeItem("medlink_refresh_token");
  sessionStorage.removeItem("medlink_token");
  sessionStorage.removeItem("medlink_refresh_token");
}

function setAccessToken(token) {
  if (localStorage.getItem("medlink_token")) {
    localStorage.setItem("medlink_token", token);
  } else if (sessionStorage.getItem("medlink_token")) {
    sessionStorage.setItem("medlink_token", token);
  } else {
    localStorage.setItem("medlink_token", token);
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const newToken = data.token;
        setAccessToken(newToken);
        if (data.refreshToken) {
          if (localStorage.getItem("medlink_refresh_token")) {
            localStorage.setItem("medlink_refresh_token", data.refreshToken);
          } else {
            sessionStorage.setItem("medlink_refresh_token", data.refreshToken);
          }
        }
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const normalizedError = new Error(
      error.response?.data?.message || error.message || "Something went wrong"
    );
    normalizedError.status = error.response?.status;
    normalizedError.data = error.response?.data;
    normalizedError.original = error;

    return Promise.reject(normalizedError);
  }
);

export default api;
