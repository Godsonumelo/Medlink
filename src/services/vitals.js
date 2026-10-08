import api from "./api";

export const vitalService = {
  getLatest: (signal) => api.get("/vitals/latest", { signal }),

  getAll: (params, signal) => api.get("/vitals", { params, signal }),

  add: (data, signal) => api.post("/vitals", data, { signal }),
};