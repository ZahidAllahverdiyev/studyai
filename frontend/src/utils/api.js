import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:5000/api";

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // səndə nədirsə
  headers: {
    'Cache-Control': 'no-cache'
  }
});

// ✅ Bunu əlavə et — hər sorğuya JWT token əlavə edir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;