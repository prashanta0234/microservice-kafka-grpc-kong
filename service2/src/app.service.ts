import { Injectable } from '@nestjs/common';
import { Product } from './interfaces/product.interface';

@Injectable()
export class AppService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      stock: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Smartphone',
      description: 'Latest smartphone model',
      price: 699.99,
      stock: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  getHello(): string {
    return 'Hello World!';
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id) || null;
  }

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
  }): Promise<Product> {
    const newProduct: Product = {
      id: (this.products.length + 1).toString(),
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    },
  ): Promise<Product | null> {
    const productIndex = this.products.findIndex(
      (product) => product.id === id,
    );
    if (productIndex === -1) return null;

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.products[productIndex];
  }

  async deleteProduct(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const productIndex = this.products.findIndex(
      (product) => product.id === id,
    );
    if (productIndex === -1) {
      return { success: false, message: 'Product not found' };
    }

    this.products.splice(productIndex, 1);
    return { success: true, message: 'Product deleted successfully' };
  }

  async getAllProducts(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = this.products.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: this.products.length,
      page,
      limit,
    };
  }
}
