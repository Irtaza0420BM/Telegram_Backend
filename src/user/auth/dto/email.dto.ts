import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for sending OTP'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
