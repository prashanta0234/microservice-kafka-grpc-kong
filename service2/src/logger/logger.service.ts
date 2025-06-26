import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { KafkaProducerService } from 'src/services/kafka-producer.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Logger implements LoggerService {
  private logger: winston.Logger;

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private configService: ConfigService,
  ) {
    this.logger = winston.createLogger({
      level: 'debug',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message }) => {
              const timestamp = new Date().toLocaleString();
              return `${timestamp} ${level}: ${message as any}`;
            }),
          ),
        }),
      ],
    });
  }

  private sendLogToKafka(message: string, lebel: string) {
    try {
      const logObject = {
        level: lebel,
        timestamp: new Date().toISOString(),
        serviceName:
          this.configService.get<string>('SERVICE_NAME') || 'default-service',
        message,
      };
      this.kafkaProducer.sendLoggerToKafka(JSON.stringify(logObject));
    } catch (error) {
      console.error(
        'Failed to send log to Kafka:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  log(message: string) {
    this.logger.info(message);
    this.sendLogToKafka(message, 'info');
  }

  error(message: string, trace?: string) {
    this.logger.error(message, trace);
    this.sendLogToKafka(message, 'error');
  }

  warn(message: string) {
    this.logger.warn(message);
    this.sendLogToKafka(message, 'warn');
  }

  debug(message: string) {
    this.logger.debug(message);
    this.sendLogToKafka(message, 'debug');
  }

  verbose(message: string) {
    this.logger.verbose(message);
    this.sendLogToKafka(message, 'verbose');
  }
}
