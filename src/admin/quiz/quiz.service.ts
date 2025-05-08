import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Tier } from './entities/tier.entity';
import { Question } from './entities/question.entity';
import { Translation } from './entities/translation.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateQuestionsDto, QuestionItemDto } from './dto/create-questions.dto';
import { UserPayment } from './entities/user-payment.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tier)
    private tierRepository: Repository<Tier>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
    @InjectRepository(UserPayment)
    private userRepository: Repository<UserPayment>
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name }
    });
  
    if (existingCategory) {
      throw new BadRequestException(`Category with name "${createCategoryDto.name}" already exists`);
    }

    const categoryWithSameRank = await this.categoryRepository.findOne({
      where: { orderRank: createCategoryDto.orderRank }
    });

    if (categoryWithSameRank) {
      throw new BadRequestException(`Category with orderRank "${createCategoryDto.orderRank}" already exists`);
    }
  
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('A category with these details already exists');
      }
      throw error;
    }
  }

  async getCategories() {
    return await this.categoryRepository.find({
      order: { orderRank: 'ASC' }
    });
  }

  async getCategoryByRank(orderRank: number) {
    const category = await this.categoryRepository.findOne({
      where: { orderRank },
      relations: ['questions']
    });

    if (!category) {
      throw new NotFoundException(`Category with orderRank ${orderRank} not found`);
    }

    return category;
  }

  async updateCategory(orderRank: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { orderRank }
    });

    if (!category) {
      throw new NotFoundException(`Category with orderRank ${orderRank} not found`);
    }

    if (updateCategoryDto.orderRank && updateCategoryDto.orderRank !== orderRank) {
      const categoryWithSameRank = await this.categoryRepository.findOne({
        where: { orderRank: updateCategoryDto.orderRank }
      });

      if (categoryWithSameRank) {
        throw new BadRequestException(`Category with orderRank "${updateCategoryDto.orderRank}" already exists`);
      }
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const categoryWithSameName = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name }
      });

      if (categoryWithSameName) {
        throw new BadRequestException(`Category with name "${updateCategoryDto.name}" already exists`);
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async getTiers() {
    return await this.tierRepository.find({
      order: { orderRank: 'ASC' }
    });
  }

  async getTierByRank(orderRank: number) {
    const tier = await this.tierRepository.findOne({
      where: { orderRank },
      relations: ['questions']
    });

    if (!tier) {
      throw new NotFoundException(`Tier with orderRank ${orderRank} not found`);
    }

    return tier;
  }

  async updateTier(orderRank: number, updateTierDto: UpdateTierDto) {
    const tier = await this.tierRepository.findOne({
      where: { orderRank }
    });

    if (!tier) {
      throw new NotFoundException(`Tier with orderRank ${orderRank} not found`);
    }

    if (updateTierDto.orderRank && updateTierDto.orderRank !== orderRank) {
      const tierWithSameRank = await this.tierRepository.findOne({
        where: { orderRank: updateTierDto.orderRank }
      });

      if (tierWithSameRank) {
        throw new BadRequestException(`Tier with orderRank "${updateTierDto.orderRank}" already exists`);
      }
    }

    Object.assign(tier, updateTierDto);
    return await this.tierRepository.save(tier);
  }

  async createQuestions(createQuestionsDto: CreateQuestionsDto) {
    const category = await this.categoryRepository.findOne({
      where: { orderRank: createQuestionsDto.category }
    });

    if (!category) {
      throw new NotFoundException(`Category with orderRank ${createQuestionsDto.category} not found`);
    }

    let tier = await this.tierRepository.findOne({
      where: { orderRank: createQuestionsDto.tier.id }
    });

    if (!tier) {
      tier = this.tierRepository.create({
        name: createQuestionsDto.tier.name,
        description: createQuestionsDto.tier.description,
        isPaid: createQuestionsDto.tier.isPaid,
        orderRank: createQuestionsDto.tier.id,
      });
      tier = await this.tierRepository.save(tier);
    }

    const savedQuestions = [];
    for (const questionItem of createQuestionsDto.questions) {
      const savedQuestion = await this.createSingleQuestion(
        questionItem,
        category.id,
        tier.id,
      );
      savedQuestions.push(savedQuestion);
    }

    return {
      message: `Successfully created ${savedQuestions.length} questions`,
      category: {
        id: category.id,
        orderRank: category.orderRank,
        name: category.name
      },
      tier: {
        id: tier.id,
        orderRank: tier.orderRank,
        name: tier.name
      },
      questions: savedQuestions,
    };
  }

  private async createSingleQuestion(
    questionItem: QuestionItemDto,
    categoryId: number,
    tierId: number,
  ) {
    if (!questionItem.options || questionItem.options.length != 4) {
      throw new BadRequestException('four options are required for a question');
    }

    if (questionItem.correct_index >= questionItem.options.length) {
      throw new BadRequestException('Correct index is out of bounds');
    }

    const question = this.questionRepository.create({
      question_text: questionItem.question,
      options: questionItem.options,
      correct_option_index: questionItem.correct_index,
      categoryId,
      tierId,
    });

    const savedQuestion = await this.questionRepository.save(question);

    if (questionItem.translations && questionItem.translations.length > 0) {
      for (const translationItem of questionItem.translations) {
        const translation = this.translationRepository.create({
          languageCode: translationItem.language,
          question_text: translationItem.question,
          options: translationItem.options,
          questionId: savedQuestion.id,
        });
        await this.translationRepository.save(translation);
      }
    }

    return savedQuestion;
  }

  async getQuestionsByCategoryAndTier(categoryRank: number, tierRank: number) {
    const category = await this.categoryRepository.findOne({
      where: { orderRank: categoryRank }
    });
    
    if (!category) {
      throw new NotFoundException(`Category with orderRank ${categoryRank} not found`);
    }
    
    const tier = await this.tierRepository.findOne({
      where: { orderRank: tierRank }
    });
    
    if (!tier) {
      throw new NotFoundException(`Tier with orderRank ${tierRank} not found`);
    }
    
    const questions = await this.questionRepository.find({
      where: { categoryId: category.id, tierId: tier.id },
      relations: ['translations']
    });
    
    return {
      category: {
        id: category.id,
        name: category.name,
        orderRank: category.orderRank
      },
      tier: {
        id: tier.id,
        name: tier.name,
        orderRank: tier.orderRank
      },
      questions
    };
  }

  async updateQuestion(questionId: number, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId }
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    if (updateQuestionDto.options) {
      if (updateQuestionDto.options.length != 4) {
        throw new BadRequestException('four options are required for a question');
      }

      const correctIndex = updateQuestionDto.correct_option_index !== undefined 
        ? updateQuestionDto.correct_option_index 
        : question.correct_option_index;
        
      if (correctIndex >= updateQuestionDto.options.length) {
        throw new BadRequestException('Correct index is out of bounds');
      }
    } else if (updateQuestionDto.correct_option_index !== undefined) {
      if (updateQuestionDto.correct_option_index >= question.options.length) {
        throw new BadRequestException('Correct index is out of bounds');
      }
    }

    Object.assign(question, updateQuestionDto);
    return await this.questionRepository.save(question);
  }

  async getTranslationsByQuestionId(questionId: number) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId }
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const translations = await this.translationRepository.find({
      where: { questionId }
    });

    return {
      question: {
        id: question.id,
        question_text: question.question_text
      },
      translations
    };
  }

  async updateTranslation(translationId: number, updateTranslationDto: UpdateTranslationDto) {
    const translation = await this.translationRepository.findOne({
      where: { id: translationId }
    });

    if (!translation) {
      throw new NotFoundException(`Translation with ID ${translationId} not found`);
    }

    if (updateTranslationDto.options) {
      const question = await this.questionRepository.findOne({
        where: { id: translation.questionId }
      });
      
      if (question && updateTranslationDto.options.length !== question.options.length) {
        throw new BadRequestException(
          `Translation options must have the same number of items as the original question options`
        );
      }
    }

    Object.assign(translation, updateTranslationDto);
    return await this.translationRepository.save(translation);
  }
}