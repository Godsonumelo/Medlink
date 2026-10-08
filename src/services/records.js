import api from "./api";

export const recordService = {
  getAll: (params, signal) => api.get("/records", { params, signal }),

  getById: (id, signal) => api.get(`/records/${id}`, { signal }),

  upload: (data, signal) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return api.post("/records", formData, { signal });
  },

  delete: (id, signal) => api.delete(`/records/${id}`, { signal }),

  download: (id, signal) => api.get(`/records/${id}/download`, { responseType: "blob", signal }),
};
