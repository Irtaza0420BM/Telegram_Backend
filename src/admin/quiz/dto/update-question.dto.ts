import { IsString, IsOptional, IsNumber, IsArray, Min, Max, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTranslationDto } from './update-translation.dto';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  question_text?: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsOptional()
  options?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  correct_option_index?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  tierId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTranslationDto)
  @IsOptional()
  translations?: UpdateTranslationDto[];
}

