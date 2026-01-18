import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { User, UserStatus } from '../users/users.entity';
import { JwtService } from '@nestjs/jwt';

interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    let payload;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const roles: string[] = payload.roles || [];

    const isAdmin = roles.includes('Admin');
    const isEditor = roles.includes('Editor');

    if (!isAdmin && !isEditor) {
      throw new ForbiddenException('Access denied: Admins only');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException('User is deleted');
    }

    request.user = {
      id: user.id,
      username: user.username,
      roles: user.roles,
      status: user.status,
    };

    return true;
  }
}
