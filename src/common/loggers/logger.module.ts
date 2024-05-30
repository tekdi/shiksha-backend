import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerService } from './logger.service';
import { WinstonModule } from 'nest-winston';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
      }),
    }),
  ],
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerService,
    },
  ],
  exports: [LoggerService],
})
export class UserLoggerModule {}