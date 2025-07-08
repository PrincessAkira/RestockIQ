import axios from "axios";

export async function getAlerts() {
  try {
    const response = await axios.get("/api/alerts/");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching alerts:", error);
    throw error;
  }
}
