import axios from "axios";

export const getAllProducts = async () => {
  const res = await axios.get("/api/products");
  return res.data;
};

export const createProduct = async (product) => {
  const res = await axios.post("/api/products", product);
  return res.data;
};
