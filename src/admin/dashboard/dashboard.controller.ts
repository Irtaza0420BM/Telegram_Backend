import { Controller, Get, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../user/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { UserStats } from './interfaces/dashboard.interface';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get platform stats',
    description: 'Get detailed platform statistics including user lists for total, new, and active users'
  })
  @ApiResponse({
    status: 200,
    description: 'Platform stats fetched successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalUsers: {
              type: 'object',
              properties: {
                count: { type: 'number' },
                users: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      username: { type: 'string' },
                      email: { type: 'string' },
                      points: { type: 'number' },
                      joinedDate: { type: 'string', format: 'date-time' },
                      lastActive: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            newUsers: {
              type: 'object',
              properties: {
                count: { type: 'number' },
                users: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      username: { type: 'string' },
                      email: { type: 'string' },
                      points: { type: 'number' },
                      joinedDate: { type: 'string', format: 'date-time' },
                      lastActive: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            activeUsers: {
              type: 'object',
              properties: {
                count: { type: 'number' },
                users: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      username: { type: 'string' },
                      email: { type: 'string' },
                      telegramId: { type: 'string' },
                      lastActiveTime: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getDashboardStats() {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      return {
        success: true,
        data: stats,
        message: 'Platform stats fetched successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Get list of all users with their details including username, email, points, ranking, and active status'
  })
  @ApiResponse({ status: 200, description: 'List of users fetched successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers(): Promise<{ success: boolean; data: UserStats[]; message: string }> {
    try {
      const users = await this.dashboardService.getAllUsers();
      return {
        success: true,
        data: users,
        message: 'Users fetched successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 