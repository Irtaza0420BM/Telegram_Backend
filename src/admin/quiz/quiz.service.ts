

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
import { TranslationImportDto } from './dto/translation-import.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Tier.name) private readonly tierModel: Model<Tier>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    @InjectModel(Translation.name) private readonly translationModel: Model<Translation>,
    @InjectModel(UserPayment.name) private readonly userPaymentModel: Model<UserPayment>,
  ) {}



  async createCategory(dto: CreateCategoryDto) {
    try {
      return await this.categoryModel.create(dto);         
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException('name or orderRank already exists');
      }
      throw err;
    }
  }

  async getCategories() {
    return this.categoryModel.find().sort({ orderRank: 1 }).lean();
  }

  async getCategoryByRank(orderRank: number) {
    const category = await this.categoryModel
      .findOne({ orderRank })
      .populate('questions')
      .lean();

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(orderRank: number, dto: UpdateCategoryDto) {
    try {
      const updated = await this.categoryModel.findOneAndUpdate(
        { orderRank },
        { $set: dto },
        { new: true },
      );
      if (!updated) throw new NotFoundException('Category not found');
      return updated;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new BadRequestException('orderRank or name already exists');
      }
      throw err;
    }
  }

  /* ------------------------------------------------------------------
     TIERS
  ------------------------------------------------------------------ */

  async getTiers() {
    return this.tierModel.find().sort({ orderRank: 1 }).lean();
  }

  async getTierByRank(orderRank: number) {
    const tier = await this.tierModel
      .findOne({ orderRank })
      .populate('questions')
      .lean();
    if (!tier) throw new NotFoundException('Tier not found');
    return tier;
  }

  async createTier(dto: UpdateTierDto) {
    try {
      return await this.tierModel.create(dto);
    } catch (err: any) {
      if (err?.code === 11000) throw new BadRequestException('orderRank already exists');
      throw err;
    }
  }

  async updateTier(orderRank: number, dto: UpdateTierDto) {
    try {
      const tier = await this.tierModel.findOneAndUpdate(
        { orderRank },
        { $set: dto },
        { new: true },
      );
      if (!tier) throw new NotFoundException('Tier not found');
      return tier;
    } catch (err: any) {
      if (err?.code === 11000) throw new BadRequestException('orderRank already exists');
      throw err;
    }
  }


  async createQuestions(dto: CreateQuestionsDto) {
    const category = await this.categoryModel.findOne({ orderRank: dto.categoryOrderRank }).lean();
    if (!category) throw new NotFoundException('Category not found');
    console.log("Category found")
    const session = await this.questionModel.db.startSession();
    try {
      return await session.withTransaction(async () => {
        const tier = await this.tierModel.findOneAndUpdate(
          { orderRank: dto.tier.orderRank },
          {
            $setOnInsert: {
              name: dto.tier.name,
              description: dto.tier.description,
              isPaid: dto.tier.isPaid,
            },
          },
          { upsert: true, new: true, session },
        );

        const questionDocs = dto.questions.map((q) => ({
                rank: q.rank,                     
                question_text: q.question,
                options: q.options,
                correct_option_index: q.correct_index,
                category: category._id,
                tier: tier._id,
                }));

        const createdQuestions = await this.questionModel.insertMany(questionDocs, { session });

        const translationDocs = dto.questions.flatMap((q, idx) =>
          (q.translations ?? []).map((t) => ({
            languageCode: t.languageCode,
            question_text: t.question,
            options: t.options,
            question: createdQuestions[idx]._id,
          })),
        );
        if (translationDocs.length) {
          await this.translationModel.insertMany(translationDocs, { session });
        }

        return {
          message: `Successfully created ${createdQuestions.length} questions`,
          category: category.name,
          tier: tier.name,
          questions: createdQuestions,
        };
      });
    } finally {
      session.endSession();
    }
  }

  /* called only from createQuestions() */
  private validateQuestionPayload(item: QuestionItemDto) {
    if (!item.options || item.options.length !== 4) {
      throw new BadRequestException('Exactly four options are required');
    }
    if (item.correct_index >= item.options.length) {
      throw new BadRequestException('correct_index is out of bounds');
    }
  }

  /* ------------------------------------------------------------------
     READ QUESTIONS BY CATEGORY & TIER
  ------------------------------------------------------------------ */

  async getQuestionsByCategoryAndTier(categoryRank: number, tierRank: number) {
    const [category, tier] = await Promise.all([
      this.categoryModel.findOne({ orderRank: categoryRank }).lean(),
      this.tierModel.findOne({ orderRank: tierRank }).lean(),
    ]);
    if (!category) throw new NotFoundException('Category not found');
    if (!tier) throw new NotFoundException('Tier not found');

    const questions = await this.questionModel
      .find({ category: category._id, tier: tier._id })
      .populate('translations')
      .lean();

    return { category, tier, questions };
  }

  /* ------------------------------------------------------------------
     SINGLE QUESTION UPDATE
  ------------------------------------------------------------------ */

  async updateQuestion(id: Types.ObjectId, dto: UpdateQuestionDto) {
    const question = await this.questionModel.findById(id);
    if (!question) throw new NotFoundException('Question not found');

    /* validate correct_index against incoming or existing options */
    const newOptions = dto.options ?? question.options;
    if (
      dto.correct_option_index !== undefined &&
      dto.correct_option_index >= newOptions.length
    ) {
      throw new BadRequestException('correct_option_index is out of bounds');
    }

    Object.assign(question, dto);
    return question.save();
  }

  /* ------------------------------------------------------------------
     TRANSLATIONS
  ------------------------------------------------------------------ */

  async getTranslationsByQuestionId(id: Types.ObjectId) {
    const question = await this.questionModel.findById(id).lean();
    if (!question) throw new NotFoundException('Question not found');

    const translations = await this.translationModel.find({ question: id }).lean();
    return { question, translations };
  }

  async updateTranslation(id: Types.ObjectId, dto: UpdateTranslationDto) {
    const translation = await this.translationModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );
    if (!translation) throw new NotFoundException('Translation not found');
    return translation;
  }

  /* ------------------------------------------------------------------
     BULK IMPORT TRANSLATIONS
  ------------------------------------------------------------------ */

  async importTranslations({ languageCode, translations }: TranslationImportDto) {
    if (!languageCode || !translations) {
      throw new BadRequestException('languageCode and translations are required');
    }

    const payload = Array.isArray(translations) ? translations : JSON.parse(translations);
    const result = { processed: 0, created: 0, updated: 0, skipped: 0, errors: [] as string[] };

    for (const block of payload) {
      const [category, tier] = await Promise.all([
        this.categoryModel.findOne({ orderRank: block.category }).lean(),
        this.tierModel.findOne({ orderRank: block.tier }).lean(),
      ]);
      if (!category || !tier) {
        result.errors.push(`Category ${block.category} / Tier ${block.tier} not found`);
        result.skipped++;
        continue;
      }

      const questionMap = new Map<number, Types.ObjectId>();
      const questions = await this.questionModel
        .find({ category: category._id, tier: tier._id })
        .lean();
      questions.forEach((q: any) => questionMap.set(q.orderRank ?? q.rank, q._id));

      for (const q of block.questions ?? []) {
        result.processed++;

        const qId = questionMap.get(q.questionId);
        if (!qId) {
          result.skipped++;
          result.errors.push(`Question ${q.questionId} not found`);
          continue;
        }

        const op = await this.translationModel.updateOne(
          { question: qId, languageCode },
          {
            $set: { question_text: q.questionText, options: q.options },
          },
          { upsert: true },
        );
        result.updated += op.modifiedCount;
        result.created += (op.upsertedCount as number) ?? 0;
      }
    }

    return { message: 'Translation import completed', result };
  }

  /* ------------------------------------------------------------------
     USER PAYMENTS
  ------------------------------------------------------------------ */

  async createUserPayment(dto: any) {
    return this.userPaymentModel.create(dto);
  }

  async getUserPayments() {
    return this.userPaymentModel.find().lean();
  }
}
