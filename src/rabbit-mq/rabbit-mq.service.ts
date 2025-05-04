// src/rabbitmq/rabbitmq.service.ts
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connectionInitialized = false;

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.connectionInitialized = true;
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.connectionInitialized) {
      await this.client.close();
      this.logger.log('RabbitMQ connection closed');
    }
  }

  async sendMessage(pattern: string, data: any) {
    this.logger.debug(
      `Sending message with pattern: ${pattern}, data: ${JSON.stringify(data)}`,
    );

    try {
      return await firstValueFrom(
        this.client.send(pattern, data).pipe(
          timeout(10000), // 10 seconds timeout
          catchError((error) => {
            this.logger.error(
              `Error sending message: ${error.message}`,
              error.stack,
            );
            throw error;
          }),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to send message: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async emitEvent(pattern: string, data: any) {
    this.logger.debug(
      `Emitting event with pattern: ${pattern}, data: ${JSON.stringify(data)}`,
    );

    try {
      return this.client.emit(pattern, data).pipe(
        catchError((error) => {
          this.logger.error(
            `Error emitting event: ${error.message}`,
            error.stack,
          );
          throw error;
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to emit event: ${error.message}`, error.stack);
      throw error;
    }
  }
}
