import api from "./api";

export const settingService = {
  getNotifications: (signal) => api.get("/settings/notifications", { signal }),

  updateNotifications: (data, signal) => api.put("/settings/notifications", data, { signal }),

  getPrivacy: (signal) => api.get("/settings/privacy", { signal }),

  updatePrivacy: (data, signal) => api.put("/settings/privacy", data, { signal }),

  deleteAccount: (signal) => api.delete("/settings/account", { signal }),
};
