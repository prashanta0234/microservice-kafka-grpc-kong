import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, Client, Transport } from '@nestjs/microservices';
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
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'product',
      protoPath: join(__dirname, '../src/proto/product.proto'),
      url: '0.0.0.0:5001',
    },
  })
  private client: ClientGrpc;

  private productService: ProductService;

  onModuleInit() {
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
