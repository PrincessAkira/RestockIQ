import axios from "axios";

export const generatePdfReport = async () => {
  const res = await axios.get("/api/reports/pdf", { responseType: "blob" });
  return res.data;
};

export const generateExcelReport = async () => {
  const res = await axios.get("/api/reports/excel", { responseType: "blob" });
  return res.data;
};
