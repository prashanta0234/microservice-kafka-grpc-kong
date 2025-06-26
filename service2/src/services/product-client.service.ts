import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientGrpc,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { firstValueFrom, Observable } from 'rxjs';
import {
  User,
  GetAllUsersResponse,
  DeleteUserResponse,
} from '../types/user.types';

interface UserService {
  getUserById(data: { id: string }): Observable<User>;
  createUser(data: { name: string; email: string }): Observable<User>;
  updateUser(data: {
    id: string;
    name?: string;
    email?: string;
  }): Observable<User>;
  deleteUser(data: { id: string }): Observable<DeleteUserResponse>;
  getAllUsers(data: {
    page?: number;
    limit?: number;
  }): Observable<GetAllUsersResponse>;
}

@Injectable()
export class ProductClientService implements OnModuleInit {
  private client: ClientGrpc;
  private userService: UserService;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

    const grpcUrl =
      nodeEnv === 'production' ? 'service1:5000' : 'localhost:5000';

    console.log(
      `Initializing gRPC client in ${nodeEnv} mode connecting to ${grpcUrl}`,
    );

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

  async getUserById(id: string): Promise<User> {
    return await firstValueFrom(this.userService.getUserById({ id }));
  }

  async createUser(data: { name: string; email: string }): Promise<User> {
    return await firstValueFrom(this.userService.createUser(data));
  }

  async updateUser(data: {
    id: string;
    name?: string;
    email?: string;
  }): Promise<User> {
    return await firstValueFrom(this.userService.updateUser(data));
  }

  async deleteUser(id: string): Promise<DeleteUserResponse> {
    return await firstValueFrom(this.userService.deleteUser({ id }));
  }

  async getAllUsers(
    page?: number,
    limit?: number,
  ): Promise<GetAllUsersResponse> {
    console.log('Calling getAllUsers on UserService via gRPC...');
    const result = await firstValueFrom(
      this.userService.getAllUsers({ page, limit }),
    );
    return result;
  }
}
