import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'user-service',
      brokers: ['localhost:9092'],
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
    console.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendUserCreatedEvent(productsData: {
    products?: Array<{
      name: string;
      description: string;
      price: number;
      stock: number;
    }>;
  }) {
    try {
      await this.producer.send({
        topic: 'user-created',
        messages: [
          {
            key: 'products-data',
            value: JSON.stringify(productsData),
          },
        ],
      });
      console.log('Products data sent to Kafka');
    } catch (error) {
      console.error('Error sending products data to Kafka:', error);
      throw error;
    }
  }
}
