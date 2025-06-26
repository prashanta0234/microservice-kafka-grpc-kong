import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { KafkaProducerService } from './services/kafka-producer.service';
import { Logger } from './logger/logger.service';

@Injectable()
export class AppService {
  private users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private logger: Logger,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async createUser(data: {
    name: string;
    email: string;
    products?: Array<{
      name: string;
      description: string;
      price: number;
      stock: number;
    }>;
  }): Promise<User> {
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(newUser);

    // Send Kafka event with products data only
    await this.kafkaProducer.sendUserCreatedEvent({
      products: data.products,
    });

    return newUser;
  }

  async updateUser(
    id: string,
    data: { name?: string; email?: string },
  ): Promise<User | null> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }

    this.users.splice(userIndex, 1);
    return { success: true, message: 'User deleted successfully' };
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = this.users.slice(startIndex, endIndex);

    this.logger.debug(
      `Retrieved ${paginatedUsers.length} users from page ${page} with limit ${limit}`,
    );

    return {
      users: paginatedUsers,
      total: this.users.length,
      page,
      limit,
    };
  }
}
