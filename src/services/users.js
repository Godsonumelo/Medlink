import api from "./api";

export const userService = {
  getAll: (signal) => api.get("/users", { signal }),
};
