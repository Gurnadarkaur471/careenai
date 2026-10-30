import axios from "axios";

const resolveBaseURL = () => {
  const raw = import.meta.env.VITE_API_URL || "/api";
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http") && !trimmed.endsWith("/api")) {
    return `${trimmed}/api`;
  }
  return trimmed || "/api";
};

const api = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("prepwise_token") || localStorage.getItem("careerai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("prepwise_token");
      localStorage.removeItem("prepwise_user");
      localStorage.removeItem("careerai_token");
      localStorage.removeItem("careerai_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
