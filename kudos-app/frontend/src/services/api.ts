import axios, { AxiosInstance } from "axios";
import {
  Kudos,
  KudosComment,
  KudosReaction,
  NotificationPreference,
  User,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add token to every request
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Kudos endpoints
  createKudos(recipientId: string, message: string) {
    return this.client.post<Kudos>("/kudos", { recipientId, message });
  }

  getKudosFeed(page: number = 1, limit: number = 20) {
    return this.client.get(`/kudos/feed?page=${page}&limit=${limit}`);
  }

  getUserSentKudos(page: number = 1, limit: number = 20) {
    return this.client.get(`/kudos/sent?page=${page}&limit=${limit}`);
  }

  getUserReceivedKudos(page: number = 1, limit: number = 20) {
    return this.client.get(`/kudos/received?page=${page}&limit=${limit}`);
  }

  getKudosById(kudosId: string) {
    return this.client.get<Kudos>(`/kudos/${kudosId}`);
  }

  editKudos(kudosId: string, message: string) {
    return this.client.patch<Kudos>(`/kudos/${kudosId}`, { message });
  }

  retractKudos(kudosId: string) {
    return this.client.delete(`/kudos/${kudosId}`);
  }

  // Comments endpoints
  addComment(kudosId: string, commentText: string) {
    return this.client.post<KudosComment>("/comments", {
      kudosId,
      commentText,
    });
  }

  getCommentsForKudos(kudosId: string, page: number = 1, limit: number = 20) {
    return this.client.get(`/comments/${kudosId}?page=${page}&limit=${limit}`);
  }

  editComment(commentId: string, commentText: string) {
    return this.client.patch<KudosComment>(`/comments/${commentId}`, {
      commentText,
    });
  }

  deleteComment(commentId: string) {
    return this.client.delete(`/comments/${commentId}`);
  }

  flagComment(commentId: string, flagReason: string, comment?: string) {
    return this.client.post(`/comments/${commentId}/flag`, {
      flagReason,
      comment,
    });
  }

  // Reactions endpoints
  addReaction(kudosId: string, emoji: string) {
    return this.client.post<KudosReaction>("/reactions", { kudosId, emoji });
  }

  getReactionsForKudos(kudosId: string) {
    return this.client.get(`/reactions/${kudosId}`);
  }

  removeReaction(kudosId: string, emoji: string) {
    return this.client.delete(`/reactions/${kudosId}/${emoji}`);
  }

  // Flags endpoints
  flagKudos(kudosId: string, flagReason: string, comment?: string) {
    return this.client.post("/flags", { kudosId, flagReason, comment });
  }

  getFlagsForKudos(kudosId: string) {
    return this.client.get(`/flags/${kudosId}`);
  }

  // Users endpoints
  listUsers(search?: string, limit: number = 20) {
    return this.client.get<User[]>(
      `/users/list?search=${search}&limit=${limit}`,
    );
  }

  getUserProfile() {
    return this.client.get<User>("/users/profile");
  }

  // Notifications endpoints
  getNotificationPreferences() {
    return this.client.get<NotificationPreference>(
      "/notifications/preferences",
    );
  }

  updateNotificationPreferences(preferences: Partial<NotificationPreference>) {
    return this.client.post<NotificationPreference>(
      "/notifications/preferences",
      preferences,
    );
  }

  // Admin endpoints
  getPendingKudos(page: number = 1, limit: number = 20) {
    return this.client.get(`/admin/kudos/pending?page=${page}&limit=${limit}`);
  }

  getFlaggedKudos(page: number = 1, limit: number = 20) {
    return this.client.get(`/admin/kudos/flagged?page=${page}&limit=${limit}`);
  }

  approveKudos(kudosId: string) {
    return this.client.patch<Kudos>(`/admin/kudos/${kudosId}/approve`);
  }

  rejectKudos(kudosId: string, reason: string) {
    return this.client.patch<Kudos>(`/admin/kudos/${kudosId}/reject`, {
      reason,
    });
  }

  clearFlagsOnKudos(kudosId: string) {
    return this.client.patch(`/admin/kudos/${kudosId}/clear-flags`);
  }

  getFlaggedComments(page: number = 1, limit: number = 20) {
    return this.client.get(
      `/admin/comments/flagged?page=${page}&limit=${limit}`,
    );
  }

  hideComment(commentId: string, reason: string) {
    return this.client.patch(`/admin/comments/${commentId}/hide`, { reason });
  }
}

export default new ApiClient();
