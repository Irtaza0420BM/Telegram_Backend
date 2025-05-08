import { IsString, IsOptional, IsNumber, IsBoolean, IsPositive } from 'class-validator';

export class UpdateTierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  orderRank?: number;
}
