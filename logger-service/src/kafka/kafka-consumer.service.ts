import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { AppService } from '../app.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const kafkaBroker =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

    console.log(
      `Initializing Kafka consumer in ${nodeEnv} mode with broker: ${kafkaBroker}`,
    );

    this.kafka = new Kafka({
      clientId: 'logger-service',
      brokers: [kafkaBroker],
    });
    this.consumer = this.kafka.consumer({ groupId: 'logger-group' });
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'microservices-logs',
      fromBeginning: true,
    });
    await this.consumer.run({
      // eslint-disable-next-line @typescript-eslint/require-await
      eachMessage: async ({ message }) => {
        if (message.value) {
          try {
            const rawEvent: unknown = JSON.parse(message.value.toString());

            if (rawEvent && typeof rawEvent === 'object') {
              const logEvent = rawEvent as {
                level: string;
                message: string;
                timestamp?: string;
                serviceName?: string;
              };

              const {
                level,
                message: logMessage,
                timestamp,
                serviceName,
              } = logEvent;

              // Create a formatted log message with service context
              const formattedMessage = serviceName
                ? `[${serviceName}] ${logMessage}`
                : logMessage;

              // Log the message with timestamp context if available
              const contextMessage = timestamp
                ? `${formattedMessage} (received at ${timestamp})`
                : formattedMessage;

              switch (level) {
                case 'info':
                  this.appService.log(contextMessage);
                  break;
                case 'warn':
                  this.appService.warn(contextMessage);
                  break;
                case 'error':
                  this.appService.error(contextMessage);
                  break;
                case 'debug':
                  this.appService.debug(contextMessage);
                  break;
                case 'verbose':
                  this.appService.verbose(contextMessage);
                  break;
                default:
                  this.appService.log(contextMessage);
                  break;
              }
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      },
    });
    console.log('Kafka consumer connected and listening for microservice logs');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
