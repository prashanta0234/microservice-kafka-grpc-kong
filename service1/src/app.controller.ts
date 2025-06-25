import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { User } from './interfaces/user.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: { id: string }): Promise<User> {
    const user = await this.appService.getUserById(data.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: { name: string; email: string }): Promise<User> {
    return await this.appService.createUser(data);
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: {
    id: string;
    name?: string;
    email?: string;
  }): Promise<User> {
    const user = await this.appService.updateUser(data.id, {
      name: data.name,
      email: data.email,
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @GrpcMethod('UserService', 'DeleteUser')
  async deleteUser(data: {
    id: string;
  }): Promise<{ success: boolean; message: string }> {
    return await this.appService.deleteUser(data.id);
  }

  @GrpcMethod('UserService', 'GetAllUsers')
  async getAllUsers(data: { page?: number; limit?: number }): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.appService.getAllUsers(data.page, data.limit);
  }
}
