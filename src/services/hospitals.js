import api from "./api";

export const hospitalService = {
  getAll: (params, signal) => api.get("/hospitals", { params, signal }),

  getById: (id, signal) => api.get(`/hospitals/${id}`, { signal }),

  getNearby: (lat, lng, radius, signal) =>
    api.get("/hospitals/nearby", { params: { lat, lng, radius }, signal }),

  getDoctors: (id, signal) => api.get(`/hospitals/${id}/doctors`, { signal }),
};
