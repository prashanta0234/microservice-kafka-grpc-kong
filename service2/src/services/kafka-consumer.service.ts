import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { AppService } from '../app.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly appService: AppService) {}

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'product-service',
      brokers: ['localhost:9092'],
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
          const event = JSON.parse(message.value.toString());
          if (event.products && Array.isArray(event.products)) {
            for (const product of event.products) {
              const created = await this.appService.createProduct(product);
              console.log('Product created from user event:', created);
            }
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
