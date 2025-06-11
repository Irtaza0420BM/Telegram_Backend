import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { ActiveUserInfo, UserStats } from './interfaces/dashboard.interface';

@Injectable()
export class DashboardService {
  private activeUsers: Map<string, ActiveUserInfo> = new Map(); // Store active user details

  constructor(
    @InjectModel('User') private userModel: Model<User>
  ) {}

  updateActiveUser(userId: string, userInfo: Omit<ActiveUserInfo, 'lastActiveTime'>) {
    this.activeUsers.set(userId, {
      ...userInfo,
      lastActiveTime: new Date()
    });

    // Remove user from active list after 30 minutes of inactivity
    setTimeout(() => {
      this.activeUsers.delete(userId);
    }, 30 * 60 * 1000);
  }

  async getDashboardStats() {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get all users for total count
      const allUsers = await this.userModel
        .find({})
        .select('username email points telegramId createdAt lastActive')
        .sort({ createdAt: -1 });

      // Get new users in last 24 hours
      const newUsers = allUsers.filter(user => 
        user.createdAt && user.createdAt >= last24Hours
      );

      // Get active users with their details
      const activeUserDetails = Array.from(this.activeUsers.values()).map(activeUser => ({
        username: activeUser.username,
        email: activeUser.email,
        telegramId: activeUser.telegramId,
        lastActiveTime: activeUser.lastActiveTime
      }));

      return {
        totalUsers: {
          count: allUsers.length,
          users: allUsers.map(user => ({
            username: user.telegramId || user.username,
            email: user.email,
            points: user.points,
            joinedDate: user.createdAt,
            lastActive: user.lastActive
          }))
        },
        newUsers: {
          count: newUsers.length,
          users: newUsers.map(user => ({
            username: user.telegramId || user.username,
            email: user.email,
            points: user.points,
            joinedDate: user.createdAt,
            lastActive: user.lastActive
          }))
        },
        activeUsers: {
          count: activeUserDetails.length,
          users: activeUserDetails
        }
      };

    } catch (error) {
      throw new HttpException(
        'Error fetching dashboard stats',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllUsers(): Promise<UserStats[]> {
    try {
      const users = await this.userModel
        .find({})
        .select('username email points telegramId lastActive createdAt')
        .sort({ points: -1 });

      return users.map((user, index) => ({
        username: user.telegramId || user.username,
        email: user.email,
        points: user.points,
        ranking: index + 1,
        lastActive: user.lastActive,
        isActive: this.activeUsers.has(user._id.toString()),
        joinedDate: user.createdAt,
        activeDetails: this.activeUsers.get(user._id.toString())
      }));

    } catch (error) {
      throw new HttpException(
        'Error fetching users',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 