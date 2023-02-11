import { User } from 'src/modules/users/users.types';

export type RequestUser = Pick<User, 'id'>;

export interface LoginProps {
  email: string;
  password: string;
}

export interface TokenData {
  accessToken: string;
  accessTokenExpired: string;
  refreshToken: string;
  refreshTokenExpired: string;
}

export interface RefreshTokenProps {
  userId: string;
  refreshToken: string;
}
