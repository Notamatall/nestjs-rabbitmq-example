// src/rabbitmq/queue-inspection.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { connect, Channel, ChannelModel } from 'amqplib';
import { RABBITMQ_CONNECTION_OPTIONS } from './rabbitmq.constants';

@Injectable()
export class QueueInspectionService {
  private readonly logger = new Logger(QueueInspectionService.name);
  private connection: ChannelModel;
  private channel: Channel;

  /**
   * Get the message count for a specific queue
   */
  async getQueueInfo(
    queueName: string = RABBITMQ_CONNECTION_OPTIONS.queue,
  ): Promise<any> {
    try {
      const url = RABBITMQ_CONNECTION_OPTIONS.urls[0];

      // Create a temporary connection to RabbitMQ
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();

      // Check if queue exists
      const queueInfo = await this.channel.checkQueue(queueName);

      // Close connections
      await this.channel.close();
      await this.connection.close();

      return {
        name: queueName,
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount,
        queue: queueInfo.queue,
      };
    } catch (error) {
      this.logger.error(
        `Error getting queue info: ${error.message}`,
        error.stack,
      );

      // Try to close connections if they were opened
      if (this.channel) {
        try {
          await this.channel.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      if (this.connection) {
        try {
          await this.connection.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      throw error;
    }
  }

  /**
   * Peek at messages in a queue without consuming them
   * @param queueName The name of the queue to inspect
   * @param count Maximum number of messages to peek at
   */
  async peekMessages(
    queueName: string = RABBITMQ_CONNECTION_OPTIONS.queue,
    count: number = 10,
  ): Promise<any[]> {
    try {
      const url = RABBITMQ_CONNECTION_OPTIONS.urls[0];

      // Create a temporary connection to RabbitMQ
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();

      const messages = [];

      // Use get to retrieve messages without acknowledging them
      for (let i = 0; i < count; i++) {
        const message = await this.channel.get(queueName, { noAck: true });

        if (!message) {
          // No more messages in the queue
          break;
        }

        try {
          // Parse the message content
          const content = JSON.parse(message.content.toString());

          messages.push({
            messageId: message.properties.messageId || `msg-${i}`,
            timestamp: message.properties.timestamp
              ? new Date(message.properties.timestamp).toISOString()
              : new Date().toISOString(),
            routingKey: message.fields.routingKey,
            exchange: message.fields.exchange,
            content,
            properties: {
              ...message.properties,
              headers: message.properties.headers || {},
            },
          });
        } catch (parseError) {
          // Handle non-JSON content
          messages.push({
            messageId: message.properties.messageId || `msg-${i}`,
            timestamp: message.properties.timestamp
              ? new Date(message.properties.timestamp).toISOString()
              : new Date().toISOString(),
            routingKey: message.fields.routingKey,
            exchange: message.fields.exchange,
            content: message.content.toString(),
            properties: {
              ...message.properties,
              headers: message.properties.headers || {},
            },
          });
        }
      }

      // Close connections
      await this.channel.close();
      await this.connection.close();

      return messages;
    } catch (error) {
      this.logger.error(
        `Error peeking messages: ${error.message}`,
        error.stack,
      );

      // Try to close connections if they were opened
      if (this.channel) {
        try {
          await this.channel.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      if (this.connection) {
        try {
          await this.connection.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      throw error;
    }
  }

  /**
   * Purge all messages from a queue
   */
  async purgeQueue(
    queueName: string = RABBITMQ_CONNECTION_OPTIONS.queue,
  ): Promise<number> {
    try {
      const url = RABBITMQ_CONNECTION_OPTIONS.urls[0];

      // Create a temporary connection to RabbitMQ
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();

      // Purge the queue
      const result = await this.channel.purgeQueue(queueName);

      // Close connections
      await this.channel.close();
      await this.connection.close();

      return result.messageCount;
    } catch (error) {
      this.logger.error(`Error purging queue: ${error.message}`, error.stack);

      // Try to close connections if they were opened
      if (this.channel) {
        try {
          await this.channel.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      if (this.connection) {
        try {
          await this.connection.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      throw error;
    }
  }
}
