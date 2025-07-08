import axios from "axios";

export const updateStock = async (id, updates) => {
  const res = await axios.put(`/api/stock/${id}`, updates);
  return res.data;
};
