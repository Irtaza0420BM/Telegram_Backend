// src/quiz/dto/create-questions.dto.ts
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ValidateIf,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

/* ---------- Custom validator: correct_index must be inside options length ---------- */
function IsIndexWithinOptions(property: string, validationOptions?: any) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isIndexWithinOptions',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: number, args: ValidationArguments) {
          const opts: string[] = (args.object as any)[property];
          return Array.isArray(opts) && value >= 0 && value < opts.length;
        },
        defaultMessage(args: ValidationArguments) {
          const opts: string[] = (args.object as any)[property];
          return `${args.property} must be between 0 and ${opts.length - 1}`;
        },
      },
    });
  };
}

/* ---------- Translation ---------- */
export class TranslationItemDto {
  @IsString() @IsNotEmpty()
  languageCode: string;

  @IsString() @IsNotEmpty()
  question: string;

  @IsArray() @ArrayMinSize(4) @ArrayMaxSize(4) @IsString({ each: true })
  options: string[];
}

/* ---------- Question ---------- */
export class QuestionItemDto {
  @IsString() @IsNotEmpty()
  question: string;

  @IsInt() @Min(1)
  rank: number;                       

  @IsArray() @ArrayMinSize(4) @ArrayMaxSize(4) @IsString({ each: true })
  options: string[];

  @IsInt() @Min(0)
  @IsIndexWithinOptions('options', { message: 'correct_index out of bounds' })
  correct_index: number;

  @IsOptional()
  @IsArray() @ValidateNested({ each: true }) @Type(() => TranslationItemDto)
  translations?: TranslationItemDto[];
}

/* ---------- Tier ---------- */
export class TierDto {
  @IsInt() @Min(1)
  orderRank: number;                       

  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsBoolean()
  isPaid: boolean;
}

/* ---------- CreateQuestionsDto ---------- */
export class CreateQuestionsDto {
  @IsInt() @Min(1)
  categoryOrderRank: number;               // clearer name

  @ValidateNested() @Type(() => TierDto)
  tier: TierDto;

  @IsArray() @ArrayMinSize(1)
  @ValidateNested({ each: true }) @Type(() => QuestionItemDto)
  questions: QuestionItemDto[];
}
