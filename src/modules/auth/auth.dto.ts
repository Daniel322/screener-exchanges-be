import { IsString, IsEmail } from 'class-validator';

import { IsPassword } from 'src/common/validators';

export class LoginBodyDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsPassword()
  readonly password: string;
}

export class RefreshBodyDto {
  @IsString()
  readonly token: string;
}
