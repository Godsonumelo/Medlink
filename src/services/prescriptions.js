import api from "./api";

export const prescriptionService = {
  getAll: (params, signal) => api.get("/prescriptions", { params, signal }),

  getById: (id, signal) => api.get(`/prescriptions/${id}`, { signal }),

  create: (data, signal) => api.post("/prescriptions", data, { signal }),

  update: (id, data, signal) => api.put(`/prescriptions/${id}`, data, { signal }),

  delete: (id, signal) => api.delete(`/prescriptions/${id}`, { signal }),
};
