import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class UpdateTranslationDto {
  @IsString()
  @IsOptional()
  languageCode?: string;

  @IsString()
  @IsOptional()
  question_text?: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsOptional()
  options?: string[];
}