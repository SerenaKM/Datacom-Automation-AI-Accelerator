export const ALLOWED_EMOJIS = ["👍", "❤️", "🎉", "😊", "😂"];

export const FLAG_REASONS = [
  "OFFENSIVE_LANGUAGE",
  "HARASSMENT",
  "SPAM",
  "INAPPROPRIATE",
  "OTHER",
];

export const EDIT_WINDOW_MINUTES = 10;
export const FLAG_COOLDOWN_MINUTES = 30;
export const FLAG_THRESHOLD = 3;
export const RETRACT_PURGE_HOURS = 24;
export const FLAG_RETENTION_DAYS = 30;
export const KUDOS_ARCHIVE_DAYS = 365;

export const isWithinEditWindow = (createdAt: Date): boolean => {
  const now = new Date();
  const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  return minutesElapsed < EDIT_WINDOW_MINUTES;
};

export const isWithinFlagCooldown = (lastFlagAt: Date | null): boolean => {
  if (!lastFlagAt) return false;
  const now = new Date();
  const minutesElapsed = (now.getTime() - lastFlagAt.getTime()) / (1000 * 60);
  return minutesElapsed < FLAG_COOLDOWN_MINUTES;
};

export const calculateTimeRemaining = (createdAt: Date): number => {
  const now = new Date();
  const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  const remaining = Math.max(0, EDIT_WINDOW_MINUTES - minutesElapsed);
  return Math.ceil(remaining);
};

export const calculateCooldownRemaining = (lastFlagAt: Date): number => {
  const now = new Date();
  const minutesElapsed = (now.getTime() - lastFlagAt.getTime()) / (1000 * 60);
  const remaining = Math.max(0, FLAG_COOLDOWN_MINUTES - minutesElapsed);
  return Math.ceil(remaining);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const trackEdit = (
  editHistory: any = null,
  newMessage: string,
): object => {
  const editArray = editHistory
    ? Array.isArray(editHistory)
      ? editHistory
      : []
    : [];
  return [
    ...editArray,
    {
      timestamp: new Date().toISOString(),
      message: newMessage,
    },
  ];
};
