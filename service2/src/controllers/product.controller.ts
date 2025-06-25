import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AppService } from '../app.service';
import { ProductClientService } from '../services/product-client.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly appService: AppService,
    private readonly productClientService: ProductClientService,
  ) {}

  @Get()
  async getAllProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    console.log('Calling getAllProducts on ProductService');
    return await this.appService.getAllProducts(page, limit);
  }

  @Post()
  async createProduct(
    @Body()
    data: {
      name: string;
      description: string;
      price: number;
      stock: number;
    },
  ) {
    return await this.appService.createProduct(data);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return await this.productClientService.getUserById(id);
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    console.log('Calling getAllUsers on UserService via gRPC...');
    return await this.productClientService.getAllUsers(page, limit);
  }

  @Post('users')
  async createUser(@Body() data: { name: string; email: string }) {
    return await this.productClientService.createUser(data);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: { name?: string; email?: string },
  ) {
    return await this.productClientService.updateUser({ id, ...data });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.productClientService.deleteUser(id);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return await this.appService.getProductById(id);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    },
  ) {
    return await this.appService.updateProduct(id, data);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.appService.deleteProduct(id);
  }

  // Cross-service calls to User Service
}
