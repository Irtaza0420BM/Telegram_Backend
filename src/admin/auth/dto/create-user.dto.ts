import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Admin email address' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Admin password' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Username of the Admin' })
  @IsString()
  username: string;
}
