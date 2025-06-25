import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { Product } from './interfaces/product.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('ProductService', 'GetProductById')
  async getProductById(data: { id: string }): Promise<Product> {
    const product = await this.appService.getProductById(data.id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  @GrpcMethod('ProductService', 'CreateProduct')
  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
  }): Promise<Product> {
    return await this.appService.createProduct(data);
  }

  @GrpcMethod('ProductService', 'UpdateProduct')
  async updateProduct(data: {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
  }): Promise<Product> {
    const product = await this.appService.updateProduct(data.id, {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
    });
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  @GrpcMethod('ProductService', 'DeleteProduct')
  async deleteProduct(data: {
    id: string;
  }): Promise<{ success: boolean; message: string }> {
    return await this.appService.deleteProduct(data.id);
  }

  @GrpcMethod('ProductService', 'GetAllProducts')
  async getAllProducts(data: { page?: number; limit?: number }): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.appService.getAllProducts(data.page, data.limit);
  }
}
