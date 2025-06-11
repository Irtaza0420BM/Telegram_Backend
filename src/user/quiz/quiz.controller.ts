import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { GetQuizDto, SubmitAnswerDto, CompleteTierDto, AddPointsDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../../schemas/user.schema';

@ApiTags('Quiz')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('question')
  @ApiOperation({ 
    summary: 'Get random quiz question',
    description: 'Fetches a random question based on user category, tier and language preference. Checks paid tier access.' 
  })
  @ApiQuery({ name: 'categoryId', description: 'Category ID', type: 'string' })
  @ApiQuery({ name: 'tierId', description: 'Tier ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Question fetched successfully' })
  @ApiResponse({ status: 403, description: 'Payment required for this tier' })
  @ApiResponse({ status: 404, description: 'No questions found' })
  async getQuestion(
    @GetUser() user: User,
    @Query('categoryId') categoryId: string,
    @Query('tierId') tierId: string
  ) {
    try {
      const hasAccess = await this.quizService.checkTierAccess(user._id.toString(), tierId);
      if (!hasAccess) {
        throw new HttpException(
          'Payment required for this tier. Please purchase tier access.',
          HttpStatus.FORBIDDEN
        );
      }

      const questionData = await this.quizService.getRandomQuestionWithTranslation(
        user._id.toString(),
        categoryId,
        tierId
      );

      return {
        success: true,
        data: questionData,
        message: 'Question fetched successfully'
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('submit-answer')
  @ApiOperation({ 
    summary: 'Submit quiz answer',
    description: 'Submits user answer and adds score for correct answers' 
  })
  @ApiBody({ type: SubmitAnswerDto })
  @ApiResponse({ status: 200, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 404, description: 'Question or user not found' })
  async submitAnswer(
    @GetUser() user: User,
    @Body() submitAnswerDto: SubmitAnswerDto
  ) {
    try {
      const result = await this.quizService.submitAnswer(
        user._id.toString(),
        submitAnswerDto.questionId,
        submitAnswerDto.selectedOptionIndex
      );

      return {
        success: true,
        data: result,
        message: result.isCorrect ? 'Correct answer! Points added.' : 'Incorrect answer.'
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('complete-tier')
  @ApiOperation({ 
    summary: 'Complete tier bonus',
    description: 'Awards bonus points when user completes a tier' 
  })
  @ApiBody({ type: CompleteTierDto })
  @ApiResponse({ status: 200, description: 'Tier completion bonus awarded' })
  async completeTier(
    @GetUser() user: User,
    @Body() completeTierDto: CompleteTierDto
  ) {
    try {
      const result = await this.quizService.completeTier(
        user._id.toString(),
        completeTierDto.tierId,
        completeTierDto.totalCorrectAnswers,
        completeTierDto.totalQuestions
      );

      return {
        success: true,
        data: result,
        message: `Tier completed! ${result.bonusPoints} bonus points awarded.`
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('add-points')
  @ApiOperation({ 
    summary: 'Add points to user',
    description: 'General purpose endpoint to add points for daily tasks and other activities' 
  })
  @ApiBody({ type: AddPointsDto })
  @ApiResponse({ status: 200, description: 'Points added successfully' })
  @ApiResponse({ status: 409, description: 'Daily task already completed' })
  async addPoints(
    @GetUser() user: User,
    @Body() addPointsDto: AddPointsDto
  ) {
    try {
      const result = await this.quizService.addPoints(
        user._id.toString(),
        addPointsDto.points,
        addPointsDto.dailyTaskId,
        addPointsDto.reason
      );

      return {
        success: true,
        data: result,
        message: addPointsDto.reason || `${addPointsDto.points} points added successfully.`
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user-progress')
  @ApiOperation({ 
    summary: 'Get user progress',
    description: 'Fetches user quiz progress and statistics' 
  })
  @ApiResponse({ status: 200, description: 'User progress fetched successfully' })
  async getUserProgress(@GetUser() user: User) {
    try {
      const result = await this.quizService.getUserProgress(user._id.toString());

      return {
        success: true,
        data: result,
        message: 'User progress fetched successfully'
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Fetches all categories so Frontend can take ids and sent to backend for other endpoints'
  })
  async getCategories() {
    try {
      const result = await this.quizService.getCategories();
      return {
        success: true,
        data: result,
        message: 'Categories fetched successfully'
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('tiers')
  @ApiOperation({
    summary: 'Get all tiers',
    description: 'Fetches all tiers so Frontend can take ids and sent to backend for other endpoints'
  })
  async getTiers() {
    try {
      const result = await this.quizService.getTiers();
      return {
        success: true,
        data: result,
        message: 'Tiers fetched successfully'
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 