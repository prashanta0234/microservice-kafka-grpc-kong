import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

interface ProductService {
  getProductById(data: { id: string }): any;
  createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
  }): any;
  updateProduct(data: {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
  }): any;
  deleteProduct(data: { id: string }): any;
  getAllProducts(data: { page?: number; limit?: number }): any;
}

@Injectable()
export class UserClientService implements OnModuleInit {
  private client: ClientGrpc;
  private productService: ProductService;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

    // Determine the correct gRPC URL based on environment
    const grpcUrl =
      nodeEnv === 'production'
        ? 'service2:5001' // Docker service name for production
        : 'localhost:5001'; // Localhost for development

    console.log(
      `Initializing gRPC client in ${nodeEnv} mode connecting to ${grpcUrl}`,
    );

    // Create gRPC client using NestJS microservices factory
    const { ClientProxyFactory } = require('@nestjs/microservices');

    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'product',
        protoPath: join(__dirname, '../src/proto/product.proto'),
        url: grpcUrl,
      },
    });

    this.productService =
      this.client.getService<ProductService>('ProductService');
  }

  async getProductById(id: string) {
    return await firstValueFrom(this.productService.getProductById({ id }));
  }

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
  }) {
    return await firstValueFrom(this.productService.createProduct(data));
  }

  async updateProduct(data: {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
  }) {
    return await firstValueFrom(this.productService.updateProduct(data));
  }

  async deleteProduct(id: string) {
    return await firstValueFrom(this.productService.deleteProduct({ id }));
  }

  async getAllProducts(page?: number, limit?: number) {
    return await firstValueFrom(
      this.productService.getAllProducts({ page, limit }),
    );
  }
}
