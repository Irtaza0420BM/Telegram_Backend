import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../../schemas/category.schema';
import { Question } from '../../schemas/question.schema';
import { Translation } from '../../schemas/translation.schema';
import { Tier } from '../../schemas/tier.schema';
import { UserPayment } from '../../schemas/user-payment.schema';
import { User } from '../../schemas/user.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Question') private questionModel: Model<Question>,
    @InjectModel('Category') private categoryModel: Model<Category>,
    @InjectModel('Tier') private tierModel: Model<Tier>,
    @InjectModel('Translation') private translationModel: Model<Translation>,
    @InjectModel('UserPayment') private userPaymentModel: Model<UserPayment>,
  ) {}

  async getRandomQuestionWithTranslation(userId: string, categoryId: string, tierId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const questions = await this.questionModel.find({
      category: categoryId,
      tier: tierId
    });

    if (questions.length === 0) {
      throw new HttpException('No questions found for this category/tier', HttpStatus.NOT_FOUND);
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];

    let questionData = {
      id: question._id,
      question_text: question.question_text,
      options: question.options,
      category: question.category,
      tier: question.tier,
      rank: question.rank
    };

    if (user.languagePreference && user.languagePreference !== 'en') {
      const translation = await this.translationModel.findOne({
        question: question._id,
        languageCode: user.languagePreference
      });

      if (translation) {
        questionData.question_text = translation.question_text;
        questionData.options = translation.options;
      }
    }

    return questionData;
  }

  async checkTierAccess(userId: string, tierId: string): Promise<boolean> {
    const tier = await this.tierModel.findById(tierId);
    if (!tier?.isPaid) return true;

    const userPayment = await this.userPaymentModel.findOne({
      user: userId,
      tier: tierId,
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    });

    return !!userPayment;
  }

  async submitAnswer(userId: string, questionId: string, selectedOptionIndex: number) {
    const question = await this.questionModel.findById(questionId);
    if (!question) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }

    const isCorrect = question.correct_option_index === selectedOptionIndex;
    const pointsEarned = isCorrect ? 10 : 0;

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: { points: pointsEarned },
        $push: {
          quizHistory: {
            quizId: questionId,
            categoryId: question.category,
            score: pointsEarned,
            completedAt: new Date()
          }
        },
        lastActive: new Date()
      },
      { new: true }
    );

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      isCorrect,
      correctOptionIndex: question.correct_option_index,
      pointsEarned,
      totalPoints: user.points
    };
  }

  async completeTier(userId: string, tierId: string, totalCorrectAnswers: number, totalQuestions: number) {
    const completionPercentage = (totalCorrectAnswers / totalQuestions) * 100;
    
    let bonusPoints = 0;
    if (completionPercentage >= 90) {
      bonusPoints = 100;
    } else if (completionPercentage >= 70) {
      bonusPoints = 50;
    } else if (completionPercentage >= 50) {
      bonusPoints = 25;
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: { points: bonusPoints },
        lastActive: new Date()
      },
      { new: true }
    );

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      bonusPoints,
      completionPercentage: Math.round(completionPercentage),
      totalPoints: user.points
    };
  }

  async addPoints(userId: string, points: number, dailyTaskId?: string, reason?: string) {
    if (dailyTaskId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const alreadyCompleted = user.dailyActivities.some(activity => 
        activity.activityId.toString() === dailyTaskId &&
        new Date(activity.completedAt) >= today &&
        new Date(activity.completedAt) < tomorrow
      );

      if (alreadyCompleted) {
        throw new HttpException(
          'Daily task already completed today',
          HttpStatus.CONFLICT
        );
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          $inc: { points: points },
          $push: {
            dailyActivities: {
              activityId: dailyTaskId,
              completedAt: new Date()
            }
          },
          lastActive: new Date()
        },
        { new: true }
      );

      return {
        pointsAdded: points,
        totalPoints: updatedUser.points,
        taskCompleted: true
      };
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: { points: points },
        lastActive: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      pointsAdded: points,
      totalPoints: updatedUser.points
    };
  }

  async getUserProgress(userId: string) {
    const user = await this.userModel.findById(userId).select('-refreshToken -OTP');
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const totalQuizzes = user.quizHistory.length;
    const totalScore = user.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayActivities = user.dailyActivities.filter(activity =>
      new Date(activity.completedAt) >= today &&
      new Date(activity.completedAt) < tomorrow
    ).length;

    return {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        languagePreference: user.languagePreference,
        points: user.points,
        tier: user.tier,
        lastActive: user.lastActive
      },
      stats: {
        totalQuizzes,
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        todayActivities
      }
    };
  }

  async getCategories() {
    const categories = await this.categoryModel.find({}, { _id: 1, name: 1, description: 1 , orderRank: 1});
    return categories;
  }

  async getTiers() {
    const tiers = await this.tierModel.find({}, { _id: 1, name: 1, description: 1 , orderRank: 1});
    return tiers;
  }
} 