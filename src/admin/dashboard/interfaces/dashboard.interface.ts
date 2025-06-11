export interface ActiveUserInfo {
  userId: string;
  username: string;
  email: string;
  lastActiveTime: Date;
  telegramId?: string;
}

export interface UserStats {
  username: string;
  email: string;
  points: number;
  ranking: number;
  lastActive: Date;
  isActive: boolean;
  joinedDate: Date;
  activeDetails?: ActiveUserInfo;
} 