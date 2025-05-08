import { Body, Controller, Post, UseGuards, Get, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateQuestionsDto } from './dto/create-questions.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('category')
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.quizService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    return this.quizService.getCategories();
  }

  @Get('category/:rank')
  @UseGuards(JwtAuthGuard)
  async getCategoryByRank(@Param('rank', ParseIntPipe) rank: number) {
    return this.quizService.getCategoryByRank(rank);
  }

  @Patch('category/:rank')
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param('rank', ParseIntPipe) rank: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.quizService.updateCategory(rank, updateCategoryDto);
  }

  @Get('tiers')
  @UseGuards(JwtAuthGuard)
  async getTiers() {
    return this.quizService.getTiers();
  }

  @Get('tier/:rank')
  @UseGuards(JwtAuthGuard)
  async getTierByRank(@Param('rank', ParseIntPipe) rank: number) {
    return this.quizService.getTierByRank(rank);
  }

  @Patch('tier/:rank')
  @UseGuards(JwtAuthGuard)
  async updateTier(
    @Param('rank', ParseIntPipe) rank: number,
    @Body() updateTierDto: UpdateTierDto
  ) {
    return this.quizService.updateTier(rank, updateTierDto);
  }

  @Post('questions')
  @UseGuards(JwtAuthGuard)
  async createQuestions(@Body() createQuestionsDto: CreateQuestionsDto) {
    return this.quizService.createQuestions(createQuestionsDto);
  }

  @Get('questions/:categoryRank/:tierRank')
  @UseGuards(JwtAuthGuard)
  async getQuestionsByCategoryAndTier(
    @Param('categoryRank', ParseIntPipe) categoryRank: number,
    @Param('tierRank', ParseIntPipe) tierRank: number
  ) {
    return this.quizService.getQuestionsByCategoryAndTier(categoryRank, tierRank);
  }

  @Patch('question/:id')
  @UseGuards(JwtAuthGuard)
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto
  ) {
    return this.quizService.updateQuestion(id, updateQuestionDto);
  }

  @Get('question/:id/translations')
  @UseGuards(JwtAuthGuard)
  async getTranslationsByQuestionId(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.getTranslationsByQuestionId(id);
  }

  @Patch('translation/:id')
  @UseGuards(JwtAuthGuard)
  async updateTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTranslationDto: UpdateTranslationDto
  ) {
    return this.quizService.updateTranslation(id, updateTranslationDto);
  }
}