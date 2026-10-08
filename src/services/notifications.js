import api from "./api";

export const notificationService = {
  getAll: (params, signal) => api.get("/notifications", { params, signal }),

  getUnread: (signal) => api.get("/notifications/unread", { signal }),

  markAsRead: (id, signal) => api.put(`/notifications/${id}/read`, undefined, { signal }),

  markAllAsRead: (signal) => api.put("/notifications/read-all", undefined, { signal }),

  delete: (id, signal) => api.delete(`/notifications/${id}`, { signal }),

  deleteAll: (signal) => api.delete("/notifications", { signal }),
};
