import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ username });
  }
  async findById(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id });
  }
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }
  async createUser(data: {
    username: string;
    roles: string[];
    status: UserStatus;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return await this.usersRepository.save(user);
  }
  async deleteUser(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
  async updateUser(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }
}
