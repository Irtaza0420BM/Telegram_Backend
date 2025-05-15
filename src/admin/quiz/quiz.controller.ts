import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateQuestionsDto } from './dto/create-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { Types } from 'mongoose';
import { TranslationImportDto } from './dto/translation-import.dto';



@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.quizService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    return this.quizService.getCategories();
  }

  @Get('categories/:orderRank')
  @UseGuards(JwtAuthGuard)
  async getCategoryByRank(@Param('orderRank', ParseIntPipe) orderRank: number) {
    return this.quizService.getCategoryByRank(orderRank);
  }

  @Patch('categories/:orderRank')
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param('orderRank', ParseIntPipe) orderRank: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.quizService.updateCategory(orderRank, updateCategoryDto);
  }

  @Get('tiers')
  @UseGuards(JwtAuthGuard)
  async getTiers() {
    return this.quizService.getTiers();
  }

  @Get('tiers/:orderRank')
  @UseGuards(JwtAuthGuard)
  async getTierByRank(@Param('orderRank', ParseIntPipe) orderRank: number) {
    return this.quizService.getTierByRank(orderRank);
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
    @Param('id') id: Types.ObjectId,
    @Body() updateQuestionDto: UpdateQuestionDto
  ) {
    return this.quizService.updateQuestion(id, updateQuestionDto);
  }

  @Get('question/:id/translations')
  @UseGuards(JwtAuthGuard)
  async getTranslationsByQuestionId(@Param('id') id: Types.ObjectId) {
    return this.quizService.getTranslationsByQuestionId(id);
  }

  @Patch('translation/:id')
  @UseGuards(JwtAuthGuard)
  async updateTranslation(
    @Param('id') id: Types.ObjectId,
    @Body() updateTranslationDto: UpdateTranslationDto
  ) {
    return this.quizService.updateTranslation(id, updateTranslationDto);
  }

  @Post('translations/import')
  @UseGuards(JwtAuthGuard)
  async importTranslations(@Body() translationImportDto: TranslationImportDto) {
    return this.quizService.importTranslations(translationImportDto);
  }
}