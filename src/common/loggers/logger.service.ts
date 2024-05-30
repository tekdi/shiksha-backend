import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const customFormat = winston.format.printf(
      ({ timestamp, level, message, context, user, error }) => {
        return JSON.stringify({
          timestamp: timestamp,
          context: context,
          user: user,
          level: level,
          message: message,
          error: error,
        });
      },
    );

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), customFormat),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  log(
    message: string,
    context?: string,
    user?: string,
    level: string = 'info',
  ) {
    this.logger.log({
      level: level,
      message: message,
      context: context,
      user: user,
      timestamp: new Date().toISOString(),
    });
  }

  error(message: string, error?: string, context?: string, user?: string) {
    this.logger.error({
      message: message,
      error: error,
      context: context,
      user: user,
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn({ message, context });
  }

  debug(message: string, context?: string) {
    this.logger.debug({ message, context });
  }
}