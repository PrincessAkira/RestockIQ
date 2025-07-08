// src/services/api.js
import axios from "axios";

// 🔧 Create a reusable Axios instance with default config
const api = axios.create({
  baseURL: "/api",           // CRA proxy forwards to Flask on port 5000
  timeout: 10000,
  withCredentials: true      // if you're using cookies or JWT
});

// Optional: add interceptors for global auth/error handling
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
