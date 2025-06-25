import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './controllers/product.controller';
import { ProductClientService } from './services/product-client.service';
import { KafkaConsumerService } from './services/kafka-consumer.service';

@Module({
  imports: [],
  controllers: [AppController, ProductController],
  providers: [AppService, ProductClientService, KafkaConsumerService],
})
export class AppModule {}
