import {
  Controller,
  NotFoundException,
  Post,
  Get,
  Body,
  Req,
  UnauthorizedException,
  ConflictException,
  UseGuards,
  Logger,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserStatus, User } from './users.entity';
import { AuthGuard } from '../guards/auth.guard';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('/login/:username')
  async login(
    @Req() request,
    @Param('username') username: string,
  ): Promise<LoginResponseDto> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new NotFoundException(`User "${username}" not found`);
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException(
        `User "${username}" is deleted and cannot log in`,
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return new LoginResponseDto(user, token);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() request): Promise<User[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access      
      const currentUserId = request.user.id;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const currentUserRoles: string[] = request.user.roles;

      const users = await this.usersService.findAll();

      return users.filter((user) => {
        // Exclude self
        if (user.id === currentUserId) return false;

        // If current user is Admin, show all others
        if (currentUserRoles.includes('Admin')) return true;

        // If current user is not Admin, exclude Admin users
        return !user.roles.includes('Admin');
      });
    } catch (error) {
      this.logger.error('Failed to fetch users', error);
      throw new UnauthorizedException('Could not fetch users');
    }
  }

  @UseGuards(AuthGuard)
  @Post('/add')
  async addUser(
    @Req() request,
    @Body() body: { username: string; roles: string[]; status: UserStatus },
  ): Promise<User> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const roles: string[] = request.user.roles;
      if (!roles.includes('Admin')) {
        throw new UnauthorizedException('Only admins can add users');
      }

      const existingUser = await this.usersService.findByUsername(
        body.username,
      );
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      const newUser = await this.usersService.createUser({
        username: body.username,
        roles: body.roles.length ? body.roles : ['User'],
        status: body.status || UserStatus.ENABLED,
      });

      return newUser;
    } catch (error) {
      this.logger.error('Failed to add user', error);
      throw error;
    }
  }
  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  async deleteUser(
    @Req() request,
    @Param('id') id: number,
  ): Promise<{ message: string }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const roles: string[] = request.user.roles;
      if (!roles.includes('Admin')) {
        throw new UnauthorizedException('Only admins can delete users');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (request.user.id === Number(id)) {
        throw new UnauthorizedException('You cannot delete yourself');
      }

      const user = await this.usersService.findById(Number(id));
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.usersService.deleteUser(Number(id));

      return { message: `User ${user.username} deleted successfully` };
    } catch (error) {
      this.logger.error('Failed to delete user', error);
      throw error;
    }
  }
  @UseGuards(AuthGuard)
  @Patch('edit/:id')
  async editUser(
    @Req() request,
    @Param('id') id: number,
    @Body() body: { username?: string; roles?: string[]; status?: UserStatus },
  ): Promise<User> {
    try {
      const user = await this.usersService.findById(Number(id));
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (body.username) user.username = body.username;
      if (body.roles) user.roles = body.roles.length ? body.roles : ['User'];
      if (body.status) user.status = body.status;

      return this.usersService.updateUser(user);
    } catch (error) {
      this.logger.error('Failed to edit user', error);
      throw error;
    }
  }
}
