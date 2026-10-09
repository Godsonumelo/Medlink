import api from "./api";

export const doctorService = {
  getAll: (params, signal) => api.get("/doctors", { params, signal }),

  getAllAdmin: (signal) => api.get("/doctors/all", { signal }),

  getById: (id, signal) => api.get(`/doctors/${id}`, { signal }),

  getBySpecialty: (specialty, signal) => api.get(`/doctors/specialty/${specialty}`, { signal }),

  search: (query, signal) => api.get("/doctors/search", { params: { q: query }, signal }),

  getReviews: (id, signal) => api.get(`/doctors/${id}/reviews`, { signal }),

  getAvailability: (id, date, signal) =>
    api.get(`/doctors/${id}/availability`, { params: { date }, signal }),
};
