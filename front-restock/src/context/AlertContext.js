import React, { createContext, useReducer, useContext, useEffect } from "react";
import { fetchStockAlerts, transformAlerts } from "../services/alertsService";

// -------------------------------------
// Initial State & Context
// -------------------------------------
const AlertContext = createContext();

const initialState = {
  alerts: [],
  loading: true,
  error: null,
};

// -------------------------------------
// Reducer Logic
// -------------------------------------
function alertReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { alerts: action.payload, loading: false, error: null };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// -------------------------------------
// Provider Component
// -------------------------------------
export const AlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Fetch alerts when component mounts
  useEffect(() => {
    dispatch({ type: "FETCH_START" });

    fetchStockAlerts()
      .then((data) => {
        const transformed = transformAlerts(data);
        dispatch({ type: "FETCH_SUCCESS", payload: transformed });
      })
      .catch((error) => {
        dispatch({ type: "FETCH_FAILURE", payload: error.message });
      });
  }, []);

  return (
    <AlertContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AlertContext.Provider>
  );
};

// -------------------------------------
// Custom Hook for Context
// -------------------------------------
export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};
