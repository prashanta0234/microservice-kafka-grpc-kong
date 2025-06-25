import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/user.controller';
import { UserClientService } from './services/user-client.service';
import { KafkaProducerService } from './services/kafka-producer.service';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [AppService, UserClientService, KafkaProducerService],
})
export class AppModule {}
