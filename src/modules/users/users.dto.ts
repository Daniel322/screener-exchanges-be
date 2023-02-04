import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDate,
} from 'class-validator';

import { IsPassword } from 'src/common/validators';

export class CreateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsNumber()
  @IsOptional()
  telegramId: number;

  @IsString()
  @IsOptional()
  @IsPassword()
  password: string;
}

export class UpdateUserDto extends CreateUserDto {
  @IsDate()
  @IsOptional()
  deletedAt: Date;
}
