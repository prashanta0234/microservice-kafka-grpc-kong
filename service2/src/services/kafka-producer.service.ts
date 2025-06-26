import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {}

  private kafka: Kafka;
  private producer: Producer;

  async onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    const kafkaBroker =
      this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092';

    console.log(
      `Initializing Kafka producer in ${nodeEnv} mode with broker: ${kafkaBroker}`,
    );

    this.kafka = new Kafka({
      clientId: 'product-service',
      brokers: [kafkaBroker],
    });

    this.producer = this.kafka.producer();
    await this.producer.connect();
    console.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendLoggerToKafka(message: string) {
    try {
      await this.producer.send({
        topic: 'microservices-logs',
        messages: [
          {
            value: message,
          },
        ],
      });
    } catch (error) {
      console.error('Error sending products data to Kafka:', error);
      throw error;
    }
  }
}
