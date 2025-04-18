import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyTfaDto {
  @ApiProperty({ example: '123456', description: 'Six-digit TFA code' })
  @IsString()
  @Length(6, 6, { message: 'TFA code must be exactly 6 digits' })
  tfaCode: string;

  @ApiProperty({ description: 'User ID or email to verify TFA for' })
  @IsString()
  userId: string;
}
