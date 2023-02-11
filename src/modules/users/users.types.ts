export interface CreateUserData {
  email: string;
  password: string;
  telegramId?: number;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  deletedAt?: Date;
}

export interface UpdatePasswordData {
  email: string;
  password: string;
  newPassword: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  telegramId?: number;
}
