import { Controller, Get, Param, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScoreService } from './score.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../../schemas/user.schema';

@ApiTags('Score')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get('leaderboard')
  @ApiOperation({ 
    summary: 'Get leaderboard',
    description: 'Get top users by points' 
  })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Number of users to return' })
  @ApiResponse({ status: 200, description: 'Leaderboard fetched successfully' })
  async getLeaderboard(@Query('limit') limit: number = 10) {
    try {
      const leaderboard = await this.scoreService.getLeaderboard(limit);

      return {
        success: true,
        data: leaderboard,
        message: 'Leaderboard fetched successfully'
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('rank')
  @ApiOperation({ 
    summary: 'Get user rank',
    description: 'Get user\'s current rank in the leaderboard' 
  })
  @ApiResponse({ status: 200, description: 'User rank fetched successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserRank(@GetUser() user: User) {
    try {
      const rank = await this.scoreService.getUserRank(user._id.toString());

      return {
        success: true,
        data: rank,
        message: 'User rank fetched successfully'
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('history')
  @ApiOperation({ 
    summary: 'Get score history',
    description: 'Get user\'s score history including quizzes and daily activities' 
  })
  @ApiResponse({ status: 200, description: 'Score history fetched successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getScoreHistory(@GetUser() user: User) {
    try {
      const history = await this.scoreService.getScoreHistory(user._id.toString());

      return {
        success: true,
        data: history,
        message: 'Score history fetched successfully'
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get score statistics',
    description: 'Get user\'s score statistics including averages and totals' 
  })
  @ApiResponse({ status: 200, description: 'Score statistics fetched successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getScoreStats(@GetUser() user: User) {
    try {
      const stats = await this.scoreService.getScoreStats(user._id.toString());

      return {
        success: true,
        data: stats,
        message: 'Score statistics fetched successfully'
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 