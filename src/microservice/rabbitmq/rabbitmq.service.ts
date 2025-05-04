// src/rabbitmq/rabbitmq.service.ts
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, timeout, of } from 'rxjs';
import { environmentConfig } from 'src/config/environment.config';

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

  /**
   * Sends a message and waits for a response (request-response pattern)
   * Only use this when you know there's a consumer to handle the message!
   */
  async sendMessage(pattern: string, data: any, timeoutMs: number = 5000) {
    this.logger.debug(
      `Sending message with pattern: ${pattern}, data: ${JSON.stringify(data)}`,
    );

    try {
      // Check if consumers are registered in this environment
      if (!environmentConfig.rabbitmq.registerConsumers) {
        this.logger.warn(
          `Sending message with pattern "${pattern}" in ${environmentConfig.environment} environment ` +
            `where NO message consumers are registered. This may cause timeouts. ` +
            `Consider using emitEvent() instead for this environment.`,
        );
      }

      return await firstValueFrom(
        this.client.send(pattern, data).pipe(
          timeout(timeoutMs),
          catchError((error) => {
            if (error.name === 'TimeoutError') {
              this.logger.warn(
                `Timeout waiting for response to message with pattern "${pattern}". ` +
                  `This is expected if no consumers are registered in this environment.`,
              );
              // Return a default response when timeout occurs
              return of({
                success: false,
                error: 'Timeout waiting for response',
                info: 'This is expected if using sendMessage() in an environment without consumers',
              });
            }
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

  /**
   * Publishes an event without waiting for a response (fire-and-forget)
   * Safe to use in any environment, as it doesn't expect a response
   */
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

  /**
   * Queue a message without waiting for a response
   * Alias for emitEvent that makes the intent clearer
   */
  async queueMessage(pattern: string, data: any) {
    return this.emitEvent(pattern, data);
  }
}
