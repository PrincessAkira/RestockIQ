import axios from "axios";

export const processSale = async (cartItems) => {
  const res = await axios.post("/api/sales", { cart: cartItems });
  return res.data;
};
