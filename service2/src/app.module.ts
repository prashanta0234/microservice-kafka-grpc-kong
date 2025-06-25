import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './controllers/product.controller';
import { ProductClientService } from './services/product-client.service';
import { KafkaConsumerService } from './services/kafka-consumer.service';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(
        __dirname,
        `../.env.${process.env.NODE_ENV || 'development'}`,
      ),
      isGlobal: true,
    }),
  ],
  controllers: [AppController, ProductController],
  providers: [AppService, ProductClientService, KafkaConsumerService],
})
export class AppModule {}
