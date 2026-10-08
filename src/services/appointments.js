import api from "./api";

export const appointmentService = {
  getAll: (params, signal) => api.get("/appointments", { params, signal }),

  getById: (id, signal) => api.get(`/appointments/${id}`, { signal }),

  book: (data, signal) => api.post("/appointments", data, { signal }),

  cancel: (id, signal) => api.put(`/appointments/${id}/cancel`, undefined, { signal }),

  reschedule: (id, data, signal) => api.put(`/appointments/${id}/reschedule`, data, { signal }),

  getUpcoming: (signal) => api.get("/appointments/upcoming", { signal }),

  getPast: (signal) => api.get("/appointments/past", { signal }),
};
