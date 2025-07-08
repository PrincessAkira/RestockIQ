// src/services/analyticsService.js
import api from "./api";

/**
 * 📦 Fetch restock recommendations based on recent sales velocity.
 * @param {number} windowDays - Number of days to look back for sales trends (default: 7)
 * @returns {Promise<Array>} List of recommendation objects
 */
export const getRestockRecommendations = (windowDays = 7) =>
  api.get(`/analytics/restock-recommendations`, {
      params: { windowDays }
  })
  .then(res => res.data)
  .catch(err => {
    console.error("❌ Restock fetch failed:", err.response?.data || err.message);
    return [];
  });

/**
 * 📉 Fetch products that frequently hit low stock levels.
 * @returns {Promise<Array>} List of products with alert counts
 */
export const getLowStockAlerts = () =>
  api.get("/analytics/low-stock-frequency")
    .then(res => res.data)
    .catch(err => {
      console.error("❌ Low stock alert fetch failed:", err.response?.data || err.message);
      return [];
    });

/**
 * 🪦 Fetch deadstock products (no sales in the last 30 days).
 * @returns {Promise<Array>} List of unsold products
 */
export const getDeadstockItems = () =>
  api.get("/analytics/deadstock")
    .then(res => res.data)
    .catch(err => {
      console.error("❌ Deadstock fetch failed:", err.response?.data || err.message);
      return [];
    });

/**
 * 📊 Fetch sales and stock analytics for dashboard insights.
 * @returns {Promise<Object>} Object containing sales trend and top products
 */
export const getAnalyticsTrends = () =>
  api.get("/analytics/trends")
    .then(res => res.data)
    .catch(err => {
      console.error("❌ Trends fetch failed:", err.response?.data || err.message);
      return {};
    });
