import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT access token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, attempt token refresh; on failure, clear tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (username, email, password) =>
  api.post("/auth/register/", { username, email, password });

export const login = (username, password) =>
  api.post("/auth/login/", { username, password });

export const getCurrentUser = () => api.get("/auth/user/");

// Pi
export const getPiDigits = () => api.get("/pi/digits/");
export const checkAnswer = (input) => api.post("/pi/check/", { input });

// Results
export const getResults = () => api.get("/results/");
export const saveResult = (mode, digits_entered, correct_digits, score_percent) =>
  api.post("/results/", { mode, digits_entered, correct_digits, score_percent });

export default api;
