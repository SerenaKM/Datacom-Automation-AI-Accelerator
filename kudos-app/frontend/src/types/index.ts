export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

export interface Kudos {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  editedBy?: EditHistory[];
  isDeleted: boolean;
  isArchived: boolean;
  isVisible: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  flagCount: number;
  sender: User;
  recipient: User;
  comments?: KudosComment[];
  reactions?: KudosReaction[];
  flags?: KudosFlag[];
}

export interface EditHistory {
  timestamp: string;
  message: string;
}

export interface KudosComment {
  id: string;
  kudosId: string;
  userId: string;
  commentText: string;
  createdAt: string;
  updatedAt: string;
  editedBy?: EditHistory[];
  isDeleted: boolean;
  flagCount: number;
  isFlagged: boolean;
  author: User;
}

export interface KudosReaction {
  id: string;
  kudosId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user: User;
}

export interface KudosFlag {
  id: string;
  kudosId: string;
  flaggedBy: string;
  flagReason: FlagReason;
  comment?: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt?: string;
  flaggedByUser: User;
}

export type FlagReason =
  | "OFFENSIVE_LANGUAGE"
  | "HARASSMENT"
  | "SPAM"
  | "INAPPROPRIATE"
  | "OTHER";

export interface NotificationPreference {
  id: string;
  userId: string;
  notifyOnKudos: boolean;
  notifyOnComments: boolean;
  notifyOnReactions: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
