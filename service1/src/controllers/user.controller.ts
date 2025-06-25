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
import { UserClientService } from '../services/user-client.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly appService: AppService,
    private readonly userClientService: UserClientService,
  ) {}

  @Get()
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.appService.getAllUsers(page, limit);
  }

  @Post()
  async createUser(
    @Body()
    data: {
      name: string;
      email: string;
      products?: Array<{
        name: string;
        description: string;
        price: number;
        stock: number;
      }>;
    },
  ) {
    return await this.appService.createUser(data);
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return await this.userClientService.getProductById(id);
  }

  @Get('products')
  async getAllProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.userClientService.getAllProducts(page, limit);
  }

  @Post('products')
  async createProduct(
    @Body()
    data: {
      name: string;
      description: string;
      price: number;
      stock: number;
    },
  ) {
    return await this.userClientService.createProduct(data);
  }

  @Put('products/:id')
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
    return await this.userClientService.updateProduct({ id, ...data });
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return await this.userClientService.deleteProduct(id);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.appService.getUserById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: { name?: string; email?: string },
  ) {
    return await this.appService.updateUser(id, data);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.appService.deleteUser(id);
  }

  // Cross-service calls to Product Service
}
