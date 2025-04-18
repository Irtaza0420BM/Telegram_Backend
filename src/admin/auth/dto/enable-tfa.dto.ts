import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EnableTfaDto {
  @ApiProperty({ description: 'User ID or email to enable TFA for' })
  @IsString()
  userId: string;
}
