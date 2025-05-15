import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './entities/category.entity';
import { Tier } from './entities/tier.entity';
import { Question } from './entities/question.entity';
import { Translation } from './entities/translation.entity';
import { UserPayment } from './entities/user-payment.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateQuestionsDto, QuestionItemDto } from './dto/create-questions.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { TranslationImportDto } from './dto/translation-import.dto'

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Tier.name) private tierModel: Model<Tier>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Translation.name) private translationModel: Model<Translation>,
    @InjectModel(UserPayment.name) private userPaymentModel: Model<UserPayment>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with name "${createCategoryDto.name}" already exists`,
      );
    }

    const categoryWithSameRank = await this.categoryModel.findOne({
      orderRank: createCategoryDto.orderRank,
    });

    if (categoryWithSameRank) {
      throw new BadRequestException(
        `Category with orderRank "${createCategoryDto.orderRank}" already exists`,
      );
    }

    const category = new this.categoryModel(createCategoryDto);
    return await category.save();
  }

  async getCategories() {
    return await this.categoryModel.find().sort({ orderRank: 1 });
  }

  async getCategoryByRank(orderRank: number) {
    const category = await this.categoryModel.findOne({ orderRank }).populate('questions');
    
    if (!category) {
      throw new NotFoundException(`Category with orderRank ${orderRank} not found`);
    }

    return category;
  }

  async updateCategory(orderRank: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findOne({ orderRank });

    if (!category) {
      throw new NotFoundException(`Category with orderRank ${orderRank} not found`);
    }

    if (updateCategoryDto.orderRank && updateCategoryDto.orderRank !== orderRank) {
      const categoryWithSameRank = await this.categoryModel.findOne({
        orderRank: updateCategoryDto.orderRank,
      });

      if (categoryWithSameRank) {
        throw new BadRequestException(
          `Category with orderRank "${updateCategoryDto.orderRank}" already exists`,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return await category.save();
  }

  // Tier Methods
  async getTiers() {
    return await this.tierModel.find().sort({ orderRank: 1 });
  }

  async getTierByRank(orderRank: number) {
    const tier = await this.tierModel.findOne({ orderRank }).populate('questions');

    if (!tier) {
      throw new NotFoundException(`Tier with orderRank ${orderRank} not found`);
    }

    return tier;
  }

  async createTier(createTierDto: UpdateTierDto) {
    const tier = new this.tierModel(createTierDto);
    return await tier.save();
  }

  async updateTier(orderRank: number, updateTierDto: UpdateTierDto) {
    const tier = await this.tierModel.findOne({ orderRank });

    if (!tier) {
      throw new NotFoundException(`Tier with orderRank ${orderRank} not found`);
    }

    Object.assign(tier, updateTierDto);
    return await tier.save();
  }

  async createQuestions(createQuestionsDto: CreateQuestionsDto) {
    const category = await this.categoryModel.findOne({ orderRank: createQuestionsDto.category });

    if (!category) {
      throw new NotFoundException(`Category with orderRank ${createQuestionsDto.category} not found`);
    }

    let tier = await this.tierModel.findOne({ orderRank: createQuestionsDto.tier.id });

    if (!tier) {
      tier = new this.tierModel({
        name: createQuestionsDto.tier.name,
        description: createQuestionsDto.tier.description,
        isPaid: createQuestionsDto.tier.isPaid,
        orderRank: createQuestionsDto.tier.id,
      });
      tier = await tier.save();
    }

    const savedQuestions = [];
    for (const questionItem of createQuestionsDto.questions) {
      const savedQuestion = await this.createSingleQuestion(
        questionItem,
        category._id,
        tier._id as Types.ObjectId,
      );
      savedQuestions.push(savedQuestion);
    }

    return {
      message: `Successfully created ${savedQuestions.length} questions`,
      category: category.name,
      tier: tier.name,
      questions: savedQuestions,
    };
  }

  private async createSingleQuestion(
    questionItem: QuestionItemDto,
    categoryId: Types.ObjectId,
    tierId: Types.ObjectId,
  ) {
    if (!questionItem.options || questionItem.options.length !== 4) {
      throw new BadRequestException('Four options are required for a question');
    }

    if (questionItem.correct_index >= questionItem.options.length) {
      throw new BadRequestException('Correct index is out of bounds');
    }

    const question = new this.questionModel({
      question_text: questionItem.question,
      options: questionItem.options,
      correct_option_index: questionItem.correct_index,
      category: categoryId,
      tier: tierId,
    });

    const savedQuestion = await question.save();

    if (questionItem.translations && questionItem.translations.length > 0) {
      for (const translationItem of questionItem.translations) {
        const translation = new this.translationModel({
          languageCode: translationItem.language,
          question_text: translationItem.question,
          options: translationItem.options,
          question: savedQuestion._id,
        });
        await translation.save();
      }
    }

    return savedQuestion;
  }

  async getQuestionsByCategoryAndTier(categoryRank: number, tierRank: number) {
    const category = await this.categoryModel.findOne({ orderRank: categoryRank });

    if (!category) {
      throw new NotFoundException(`Category with orderRank ${categoryRank} not found`);
    }

    const tier = await this.tierModel.findOne({ orderRank: tierRank });

    if (!tier) {
      throw new NotFoundException(`Tier with orderRank ${tierRank} not found`);
    }

    const questions = await this.questionModel.find({ category, tier }).populate('translations');

    return { category, tier, questions };
  }

  async updateQuestion(questionId: Types.ObjectId, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.questionModel.findById(questionId);

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    if (updateQuestionDto.options && updateQuestionDto.options.length !== 4) {
      throw new BadRequestException('Four options are required for a question');
    }

    if (updateQuestionDto.correct_option_index !== undefined && updateQuestionDto.correct_option_index >= updateQuestionDto.options.length) {
      throw new BadRequestException('Correct index is out of bounds');
    }

    Object.assign(question, updateQuestionDto);
    return await question.save();
  }

  async getTranslationsByQuestionId(questionId: Types.ObjectId) {
    const question = await this.questionModel.findById(questionId);

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const translations = await this.translationModel.find({ question: questionId });
    return { question, translations };
  }

  async updateTranslation(translationId: Types.ObjectId, updateTranslationDto: UpdateTranslationDto) {
    const translation = await this.translationModel.findById(translationId);

    if (!translation) {
      throw new NotFoundException(`Translation with ID ${translationId} not found`);
    }

    Object.assign(translation, updateTranslationDto);
    return await translation.save();
  }

  async createUserPayment(userPaymentDto: any) {
    const userPayment = new this.userPaymentModel(userPaymentDto);
    return await userPayment.save();
  }

  async getUserPayments() {
    return await this.userPaymentModel.find();
  }

async importTranslations(translationImportDto: TranslationImportDto) {
  const { languageCode, translations } = translationImportDto;
  
  if (!languageCode || !translations) {
    throw new BadRequestException('Language code and translations are required');
  }

  const results = {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const translationData = Array.isArray(translations) ? translations : JSON.parse(translations);
    
    for (const data of translationData) {
      if (data.category === undefined || data.tier === undefined) {
        results.errors.push('Missing category or tier rank in translation data');
        continue;
      }

      const category = await this.categoryModel.findOne({ rank: data.category });
      if (!category) {
        results.errors.push(`Category with rank ${data.category} not found`);
        continue;
      }

      const tier = await this.tierModel.findOne({ rank: data.tier });
      if (!tier) {
        results.errors.push(`Tier with rank ${data.tier} not found`);
        continue;
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        results.errors.push(`No valid questions provided for category ${data.category}, tier ${data.tier}`);
        continue;
      }

      const questions = await this.questionModel.find({ 
        category: category._id, 
        tier: tier._id 
      }).sort({ rank: 1 }); 

      if (questions.length === 0) {
        results.errors.push(`No questions found for category ${data.category}, tier ${data.tier}`);
        continue;
      }

      for (const questionData of data.questions) {
        results.processed++;
        
        if (!questionData.questionId) {
          results.errors.push(`Missing questionId for category ${data.category}, tier ${data.tier}`);
          results.skipped++;
          continue;
        }

        if (!questionData.questionText || !Array.isArray(questionData.options)) {
          results.errors.push(`Invalid question data for questionId ${questionData.questionId}`);
          results.skipped++;
          continue;
        }

        const question = questions.find(q => q.rank === questionData.questionId);
        
        if (!question) {
          results.errors.push(`Question with id ${questionData.questionId} not found in category ${data.category}, tier ${data.tier}`);
          results.skipped++;
          continue;
        }

        const existingTranslation = await this.translationModel.findOne({
          question: question._id,
          languageCode,
        });

        if (existingTranslation) {
          existingTranslation.question_text = questionData.questionText;
          existingTranslation.options = questionData.options;
          await existingTranslation.save();
          results.updated++;
        } else {
          const translation = new this.translationModel({
            languageCode,
            question_text: questionData.questionText,
            options: questionData.options,
            question: question._id,
          });
          await translation.save();
          results.created++;
        }
      }
    }

    return {
      message: 'Translation import completed',
      results,
    };
  } catch (error) {
    throw new BadRequestException(`Error importing translations: ${error.message}`);
  }
}
}