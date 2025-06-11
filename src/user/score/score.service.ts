import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';

@Injectable()
export class ScoreService {
  constructor(
    @InjectModel('User') private userModel: Model<User>
  ) {}

  async getLeaderboard(limit: number = 10) {
    const users = await this.userModel
      .find({})
      .select('username points tier')
      .sort({ points: -1 })
      .limit(limit);

    return users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      points: user.points,
      tier: user.tier
    }));
  }

  async getUserRank(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const higherScores = await this.userModel.countDocuments({
      points: { $gt: user.points }
    });

    return {
      rank: higherScores + 1,
      username: user.username,
      points: user.points,
      tier: user.tier
    };
  }

  async getScoreHistory(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('quizHistory dailyActivities');

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const allActivities = [
      ...user.quizHistory.map(quiz => ({
        type: 'quiz',
        score: quiz.score,
        date: quiz.completedAt,
        details: { quizId: quiz.quizId, categoryId: quiz.categoryId }
      })),
      ...user.dailyActivities.map(activity => ({
        type: 'daily',
        date: activity.completedAt,
        details: { activityId: activity.activityId }
      }))
    ];

    allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return allActivities;
  }

  async getScoreStats(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const quizScores = user.quizHistory.map(quiz => quiz.score);
    const totalQuizzes = quizScores.length;
    const totalScore = quizScores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;
    const highestScore = Math.max(...(quizScores.length ? quizScores : [0]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivities = user.dailyActivities.filter(
      activity => new Date(activity.completedAt) >= today
    );

    return {
      totalQuizzes,
      totalScore,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      todayActivities: todayActivities.length,
      totalPoints: user.points
    };
  }
} 