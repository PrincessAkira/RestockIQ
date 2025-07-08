import axios from "axios";

export const loginUser = async (credentials) => {
  const res = await axios.post("/api/auth/login", credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await axios.post("/api/auth/register", userData);
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem("authToken");
};
