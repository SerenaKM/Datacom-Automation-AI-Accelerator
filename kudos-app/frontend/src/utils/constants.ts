export const ALLOWED_EMOJIS = ["👍", "❤️", "🎉", "😊", "😂"];

export const FLAG_REASONS = [
  "OFFENSIVE_LANGUAGE",
  "HARASSMENT",
  "SPAM",
  "INAPPROPRIATE",
  "OTHER",
];

export const FLAG_REASON_LABELS: Record<string, string> = {
  OFFENSIVE_LANGUAGE: "Offensive Language",
  HARASSMENT: "Harassment",
  SPAM: "Spam",
  INAPPROPRIATE: "Inappropriate Content",
  OTHER: "Other",
};

export const API_ENDPOINTS = {
  KUDOS: "/api/kudos",
  COMMENTS: "/api/comments",
  REACTIONS: "/api/reactions",
  FLAGS: "/api/flags",
  USERS: "/api/users",
  NOTIFICATIONS: "/api/notifications",
  ADMIN: "/api/admin",
};

export const VALIDATION = {
  KUDOS_MAX_LENGTH: 280,
  COMMENT_MAX_LENGTH: 150,
  EDIT_WINDOW_MINUTES: 10,
  FLAG_COOLDOWN_MINUTES: 30,
  FLAG_THRESHOLD: 3,
};

export const MESSAGES = {
  KUDOS_SENT: "Kudos sent successfully!",
  KUDOS_RETRACTED: "Kudos retracted",
  COMMENT_ADDED: "Comment added",
  COMMENT_DELETED: "Comment deleted",
  FLAG_SUBMITTED: "Flag submitted for review",
  INVALID_SELECTION: "Please select a valid option",
  REQUIRED_FIELD: "This field is required",
};
