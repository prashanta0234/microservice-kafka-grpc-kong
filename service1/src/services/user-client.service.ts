import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientGrpc,
  Transport,
  ClientProxyFactory,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { firstValueFrom, Observable } from 'rxjs';

interface ProductService {
  getProductById(data: { id: string }): Observable<any>;
  createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
  }): Observable<any>;
  updateProduct(data: {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
  }): Observable<any>;
  deleteProduct(data: { id: string }): Observable<any>;
  getAllProducts(data: { page?: number; limit?: number }): Observable<any>;
}

@Injectable()
export class UserClientService implements OnModuleInit {
  private client: ClientGrpc;
  private productService: ProductService;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

    const grpcUrl =
      nodeEnv === 'production' ? 'service2:5001' : 'localhost:5001';

    console.log(
      `Initializing gRPC client in ${nodeEnv} mode connecting to ${grpcUrl}`,
    );

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

  async getProductById(id: string): Promise<any> {
    return await firstValueFrom(this.productService.getProductById({ id }));
  }

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
  }): Promise<any> {
    return await firstValueFrom(this.productService.createProduct(data));
  }

  async updateProduct(data: {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
  }): Promise<any> {
    return await firstValueFrom(this.productService.updateProduct(data));
  }

  async deleteProduct(id: string): Promise<any> {
    return await firstValueFrom(this.productService.deleteProduct({ id }));
  }

  async getAllProducts(page?: number, limit?: number): Promise<any> {
    return await firstValueFrom(
      this.productService.getAllProducts({ page, limit }),
    );
  }
}
