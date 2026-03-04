import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:5000/api"; // yalnız local üçün

const api = axios.create({ baseURL });

export default api;