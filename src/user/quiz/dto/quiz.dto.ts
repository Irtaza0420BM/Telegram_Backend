import { IsString, IsNumber, IsOptional, IsMongoId, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetQuizDto {
  @ApiProperty({ description: 'Category ID' })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({ description: 'Tier ID' })
  @IsMongoId()
  tierId: string;
}

export class SubmitAnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsMongoId()
  questionId: string;

  @ApiProperty({ description: 'Selected option index', minimum: 0 })
  @IsNumber()
  @Min(0)
  selectedOptionIndex: number;
}

export class CompleteTierDto {
  @ApiProperty({ description: 'Tier ID' })
  @IsMongoId()
  tierId: string;

  @ApiProperty({ description: 'Total correct answers', minimum: 0 })
  @IsNumber()
  @Min(0)
  totalCorrectAnswers: number;

  @ApiProperty({ description: 'Total questions', minimum: 0 })
  @IsNumber()
  @Min(0)
  totalQuestions: number;
}

export class AddPointsDto {
  @ApiProperty({ description: 'Points to add', minimum: 1 })
  @IsNumber()
  @Min(1)
  points: number;

  @ApiProperty({ description: 'Daily task ID', required: false })
  @IsMongoId()
  @IsOptional()
  dailyTaskId?: string;

  @ApiProperty({ description: 'Reason for adding points', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
} 