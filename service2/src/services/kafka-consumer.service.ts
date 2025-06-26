import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { AppService } from '../app.service';
import {
  UserCreatedEvent,
  isUserCreatedEvent,
} from '../types/kafka-events.types';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const kafkaBroker =
      this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092';
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

    console.log(
      `Initializing Kafka consumer in ${nodeEnv} mode with broker: ${kafkaBroker}`,
    );

    this.kafka = new Kafka({
      clientId: 'product-service',
      brokers: [kafkaBroker],
    });
    this.consumer = this.kafka.consumer({ groupId: 'product-group' });
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'user-created',
      fromBeginning: true,
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          try {
            const rawEvent: unknown = JSON.parse(message.value.toString());

            if (isUserCreatedEvent(rawEvent)) {
              const event: UserCreatedEvent = rawEvent;

              if (event.products && event.products.length > 0) {
                console.log(
                  `Processing ${event.products.length} products from user-created event`,
                );

                for (const product of event.products) {
                  const created = await this.appService.createProduct(product);
                  console.log('Product created from user event:', created);
                }
              } else {
                console.log(
                  'User-created event received but no products to process',
                );
              }
            } else {
              console.warn(
                'Received invalid user-created event format:',
                rawEvent,
              );
            }
          } catch (error) {
            console.error('Error processing user-created event:', error);
          }
        }
      },
    });
    console.log(
      'Kafka consumer connected and listening for user-created events',
    );
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
