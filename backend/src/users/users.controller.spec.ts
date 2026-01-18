import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import {
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { UserStatus } from './users.entity';

const mockUsersService = {
  findByUsername: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  createUser: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('jwt-token'),
};

const mockLogger = { error: jest.fn() };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================= LOGIN =================
  describe('login', () => {
    it('should login successfully', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        id: 1,
        username: 'john',
        roles: ['User'],
        status: UserStatus.ENABLED,
      });

      const result = await controller.login({} as any, 'john');

      expect(result.access_token).toBe('jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(controller.login({} as any, 'unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if user is deleted', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        id: 1,
        username: 'john',
        roles: ['User'],
        status: UserStatus.DELETED,
      });

      await expect(controller.login({} as any, 'john')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ================= FIND ALL =================
  describe('findAll', () => {
    it('should return paginated users for admin', async () => {
      mockUsersService.findAll.mockResolvedValue([
        { id: 1, roles: ['User'] },
        { id: 2, roles: ['Admin'] },
        { id: 3, roles: ['User'] },
      ]);

      const req = { user: { id: 99, roles: ['Admin'] } };

      const result = await controller.findAll(req as any, 1, 2);

      expect(result.users.length).toBe(2);
      expect(result.total).toBe(3);
    });

    it('should hide admin users for non-admin', async () => {
      mockUsersService.findAll.mockResolvedValue([
        { id: 1, roles: ['User'] },
        { id: 2, roles: ['Admin'] },
      ]);

      const req = { user: { id: 99, roles: ['User'] } };

      const result = await controller.findAll(req as any, 1, 5);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].roles).toEqual(['User']);
    });
  });

  // ================= ADD USER =================
  describe('addUser', () => {
    it('should add user as admin', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue({
        id: 1,
        username: 'newuser1',
      });

      const req = { user: { roles: ['Admin'] } };

      const result = await controller.addUser(req as any, {
        username: 'newuser1',
        roles: ['User'],
        status: UserStatus.ENABLED,
      });

      expect(result.username).toBe('newuser1');
    });

    it('should block non-admin', async () => {
      const req = { user: { roles: ['User'] } };

      await expect(
        controller.addUser(req as any, {
          username: 'x',
          roles: [],
          status: UserStatus.ENABLED,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw conflict if username exists', async () => {
      mockUsersService.findByUsername.mockResolvedValue({ id: 1 });

      const req = { user: { roles: ['Admin'] } };

      await expect(
        controller.addUser(req as any, {
          username: 'existing',
          roles: [],
          status: UserStatus.ENABLED,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ================= DELETE USER =================
  describe('deleteUser', () => {
    it('should delete user as admin', async () => {
      // user to delete
      mockUsersService.findById.mockResolvedValue({ id: 2, username: 'user2' });
      mockUsersService.deleteUser.mockResolvedValue(undefined);

      const req = { user: { id: 1, roles: ['Admin'] } }; // logged-in user

      const result = await controller.deleteUser(req as any, 2); // deleting user 2

      expect(result.message).toContain('deleted successfully');
    });

    it('should prevent deleting yourself', async () => {
      const req = { user: { id: 1, roles: ['Admin'] } };

      await expect(controller.deleteUser(req as any, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ================= EDIT USER =================
  describe('editUser', () => {
    it('should update user successfully', async () => {
      const existingUser = {
        id: 1,
        username: 'old',
        roles: ['User'],
        status: UserStatus.ENABLED,
      };
      const updatedUser = { ...existingUser, username: 'new' };

      mockUsersService.findById.mockResolvedValue(existingUser);
      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.editUser({} as any, 1, {
        username: 'new',
      });

      expect(result.username).toBe('new');
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(updatedUser);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });
});
