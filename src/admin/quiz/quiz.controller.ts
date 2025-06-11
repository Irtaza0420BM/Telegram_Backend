import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateQuestionsDto } from './dto/create-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { Types } from 'mongoose';
import { TranslationImportDto } from './dto/translation-import.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Quiz Management')
@Controller('quiz')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('categories')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.quizService.createCategory(createCategoryDto);
  }

  @Get('categories')
  async getCategories() {
    return this.quizService.getCategories();
  }

  @Get('categories/:orderRank')
  async getCategoryByRank(@Param('orderRank', ParseIntPipe) orderRank: number) {
    return this.quizService.getCategoryByRank(orderRank);
  }

  @Patch('categories/:orderRank')
  async updateCategory(
    @Param('orderRank', ParseIntPipe) orderRank: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.quizService.updateCategory(orderRank, updateCategoryDto);
  }

  @Get('tiers')
  async getTiers() {
    return this.quizService.getTiers();
  }

  @Get('tiers/:orderRank')
  async getTierByRank(@Param('orderRank', ParseIntPipe) orderRank: number) {
    return this.quizService.getTierByRank(orderRank);
  }

  @Post('questions')
  async createQuestions(@Body() createQuestionsDto: CreateQuestionsDto) {
    return this.quizService.createQuestions(createQuestionsDto);
  }

  @Get('questions/:categoryRank/:tierRank')
  async getQuestionsByCategoryAndTier(
    @Param('categoryRank', ParseIntPipe) categoryRank: number,
    @Param('tierRank', ParseIntPipe) tierRank: number
  ) {
    return this.quizService.getQuestionsByCategoryAndTier(categoryRank, tierRank);
  }

  @Patch('question/:id')
  async updateQuestion(
    @Param('id') id: Types.ObjectId,
    @Body() updateQuestionDto: UpdateQuestionDto
  ) {
    return this.quizService.updateQuestion(id, updateQuestionDto);
  }

  @Get('question/:id/translations')
  async getTranslationsByQuestionId(@Param('id') id: Types.ObjectId) {
    return this.quizService.getTranslationsByQuestionId(id);
  }

  @Patch('translation/:id')
  async updateTranslation(
    @Param('id') id: Types.ObjectId,
    @Body() updateTranslationDto: UpdateTranslationDto
  ) {
    return this.quizService.updateTranslation(id, updateTranslationDto);
  }

  @Post('translations/import')
  async importTranslations(@Body() translationImportDto: TranslationImportDto) {
    return this.quizService.importTranslations(translationImportDto);
  }
}