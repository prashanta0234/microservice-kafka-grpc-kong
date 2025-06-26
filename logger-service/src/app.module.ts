import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaConsumerService } from './kafka/kafka-consumer.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [ConfigService, AppService, KafkaConsumerService],
})
export class AppModule {}
