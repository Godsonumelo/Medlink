import api from "./api";

export const dashboardService = {
  get: (signal) => api.get("/dashboard", { signal }),
};