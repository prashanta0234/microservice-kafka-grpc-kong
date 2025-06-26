import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor(private configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.logger = winston.createLogger({
      level: 'debug',
      transports: [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        new winston.transports.Console({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          format: winston.format.combine(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            winston.format.colorize(),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            winston.format.printf(({ level, message }) => {
              const timestamp = new Date().toLocaleString();
              return `${timestamp} ${level}: ${message}`;
            }),
          ),
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        new winston.transports.DailyRotateFile({
          filename: 'logs/%DATE%-app.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '14d',
          maxSize: '10m',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          format: winston.format.combine(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            winston.format.printf(({ level, message }) => {
              const timestamp = new Date().toISOString();
              return JSON.stringify({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                level,
                timestamp,
                serviceName:
                  this.configService.get<string>('SERVICE_NAME') ||
                  'default-service',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                message,
              });
            }),
          ),
        }),
      ],
    });
  }

  log(message: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.logger.error(message, trace);
  }

  warn(message: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.logger.warn(message);
  }

  debug(message: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.logger.debug(message);
  }

  verbose(message: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.logger.verbose(message);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
