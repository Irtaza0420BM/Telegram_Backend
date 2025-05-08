import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  IsArray, 
  ValidateNested, 
  IsOptional,
  Min,
  ArrayMinSize,
  IsBoolean
} from 'class-validator';

export class TranslationItemDto {
  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options: string[];
}

export class QuestionItemDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options: string[];

  @IsNumber()
  @Min(0)
  correct_index: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationItemDto)
  translations?: TranslationItemDto[];
}

export class tierDto{
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  id?: number;

  @IsBoolean()
  isPaid?: boolean;


}

export class CreateQuestionsDto {
  @IsNumber()
  category: number;

  @Type(()=>tierDto)
  tier: tierDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionItemDto)
  @ArrayMinSize(1)
  questions: QuestionItemDto[];
}