import axios from "axios";

// In production (Vercel) VITE_API_URL points at the deployed backend, e.g.
// https://inventory-api.onrender.com. In dev / Docker it defaults to /api,
// which the Vite proxy and nginx forward to the backend.
const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({ baseURL });

// Normalize backend errors into a single readable message for the UI.
export function errorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) {
    // FastAPI validation errors -> "field: message"
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "";
        return field ? `${field}: ${d.msg}` : d.msg;
      })
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  if (err?.message) return err.message;
  return "Something went wrong. Please try again.";
}

export const Products = {
  list: () => api.get("/products").then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (body) => api.post("/products", body).then((r) => r.data),
  update: (id, body) => api.put(`/products/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`),
};

export const Customers = {
  list: () => api.get("/customers").then((r) => r.data),
  get: (id) => api.get(`/customers/${id}`).then((r) => r.data),
  create: (body) => api.post("/customers", body).then((r) => r.data),
  remove: (id) => api.delete(`/customers/${id}`),
};

export const Orders = {
  list: () => api.get("/orders").then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (body) => api.post("/orders", body).then((r) => r.data),
  remove: (id) => api.delete(`/orders/${id}`),
};

export const Dashboard = {
  summary: () => api.get("/dashboard/summary").then((r) => r.data),
};
