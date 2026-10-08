import api from "./api";

export const authService = {
  login: (credentials, signal) => api.post("/auth/login", credentials, { signal }),

  register: (data, signal) => api.post("/auth/register", data, { signal }),

  logout: (signal) => api.post("/auth/logout", undefined, { signal }),

  getProfile: (signal) => api.get("/auth/profile", { signal }),

  updateProfile: (data, signal) => api.put("/auth/profile", data, { signal }),

  updatePassword: (data, signal) => api.put("/auth/password", data, { signal }),

  forgotPassword: (email, signal) => api.post("/auth/forgot-password", { email }, { signal }),

  resetPassword: (token, password, signal) =>
    api.post("/auth/reset-password", { token, password }, { signal }),

  refreshToken: (refreshToken, signal) =>
    api.post("/auth/refresh", { refreshToken }, { signal }),

  googleAuth: (token, signal) => api.post("/auth/google", { token }, { signal }),

  appleAuth: (token, signal) => api.post("/auth/apple", { token }, { signal }),
};
