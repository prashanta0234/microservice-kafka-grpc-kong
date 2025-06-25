import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, Client, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

interface UserService {
  getUserById(data: { id: string }): any;
  createUser(data: { name: string; email: string }): any;
  updateUser(data: { id: string; name?: string; email?: string }): any;
  deleteUser(data: { id: string }): any;
  getAllUsers(data: { page?: number; limit?: number }): any;
}

@Injectable()
export class ProductClientService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '../src/proto/user.proto'),
      url: '0.0.0.0:5000',
    },
  })
  private client: ClientGrpc;

  private userService: UserService;

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  async getUserById(id: string) {
    return await firstValueFrom(this.userService.getUserById({ id }));
  }

  async createUser(data: { name: string; email: string }) {
    return await firstValueFrom(this.userService.createUser(data));
  }

  async updateUser(data: { id: string; name?: string; email?: string }) {
    return await firstValueFrom(this.userService.updateUser(data));
  }

  async deleteUser(id: string) {
    return await firstValueFrom(this.userService.deleteUser({ id }));
  }

  async getAllUsers(page?: number, limit?: number) {
    console.log('Calling getAllUsers on UserService via gRPC...');
    const result = await firstValueFrom(
      this.userService.getAllUsers({ page, limit }),
    );
    console.log('gRPC result:', result);
    return result;
  }
}
