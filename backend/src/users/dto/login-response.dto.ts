// src/users/dto/login-response.dto.ts
import { UserStatus } from '../users.entity';

export class LoginResponseDto {
  access_token: string;
  id: number;
  username: string;
  roles: string[];
  status: UserStatus;

  constructor(
    user: { id: number; username: string; roles: string[]; status: UserStatus },
    token: string,
  ) {
    this.access_token = token;
    this.id = user.id;
    this.username = user.username;
    this.roles = user.roles;
    this.status = user.status;
  }
}
