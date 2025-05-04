/* eslint-disable @typescript-eslint/no-unused-vars */
// src/rabbitmq/rabbitmq.health.ts
import { Injectable, Logger } from '@nestjs/common';
import { connect, Connection, Channel, ChannelModel } from 'amqplib';
import { RABBITMQ_CONNECTION_OPTIONS } from './rabbitmq.constants';

@Injectable()
export class RabbitMQHealthService {
  private readonly logger = new Logger(RabbitMQHealthService.name);
  private connection: ChannelModel;
  private channel: Channel;

  async checkHealth(): Promise<{ status: string; details?: any }> {
    try {
      const url = RABBITMQ_CONNECTION_OPTIONS.urls[0];

      // Create a temporary connection to check RabbitMQ health
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();

      // Check if queue exists, if not, create it to ensure it exists with correct settings
      await this.channel.assertQueue(
        RABBITMQ_CONNECTION_OPTIONS.queue,
        RABBITMQ_CONNECTION_OPTIONS.queueOptions,
      );

      // Get queue info
      const queueInfo = await this.channel.checkQueue(
        RABBITMQ_CONNECTION_OPTIONS.queue,
      );

      // Close connections
      await this.channel.close();
      await this.connection.close();

      return {
        status: 'ok',
        details: {
          queue: RABBITMQ_CONNECTION_OPTIONS.queue,
          messageCount: queueInfo.messageCount,
          consumerCount: queueInfo.consumerCount,
        },
      };
    } catch (error) {
      this.logger.error(
        `RabbitMQ health check failed: ${error.message}`,
        error.stack,
      );

      // Try to close connections if they were opened
      if (this.channel) {
        try {
          await this.channel.close();
        } catch (e: any) {
          // Ignore close errors
        }
      }

      if (this.connection) {
        try {
          await this.connection.close();
        } catch (e: any) {
          // Ignore close errors
        }
      }

      return {
        status: 'error',
        details: {
          error: error.message,
          code: error.code,
          errno: error.errno,
        },
      };
    }
  }
}
