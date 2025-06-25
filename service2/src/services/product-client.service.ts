import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
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
  private client: ClientGrpc;
  private userService: UserService;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

    // Determine the correct gRPC URL based on environment
    const grpcUrl =
      nodeEnv === 'production'
        ? 'service1:5000' // Docker service name for production
        : 'localhost:5000'; // Localhost for development

    console.log(
      `Initializing gRPC client in ${nodeEnv} mode connecting to ${grpcUrl}`,
    );

    // Create gRPC client using NestJS microservices factory
    const { ClientProxyFactory } = require('@nestjs/microservices');

    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(__dirname, '../src/proto/user.proto'),
        url: grpcUrl,
      },
    });

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
