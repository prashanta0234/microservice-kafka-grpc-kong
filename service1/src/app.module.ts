import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/user.controller';
import { UserClientService } from './services/user-client.service';
import { KafkaProducerService } from './services/kafka-producer.service';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { Logger } from './logger/logger.service';
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
  controllers: [AppController, UserController],
  providers: [AppService, UserClientService, KafkaProducerService, Logger],
})
export class AppModule {}
