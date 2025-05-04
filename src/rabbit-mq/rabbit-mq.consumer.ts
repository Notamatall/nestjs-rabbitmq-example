// src/rabbitmq/message.consumer.ts
import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  EventPattern,
} from '@nestjs/microservices';

@Controller()
export class MessageConsumer {
  private readonly logger = new Logger(MessageConsumer.name);

  @MessagePattern('message_pattern')
  handleMessage(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Received message: ${JSON.stringify(data)}`);

      // Process the message here
      const result = { received: true, data, processedAt: new Date() };

      // Acknowledge the message
      channel.ack(originalMsg);

      // Return a response
      return result;
    } catch (error) {
      this.logger.error(
        `Error processing message: ${error.message}`,
        error.stack,
      );

      // In case of error, we should still acknowledge the message to prevent redelivery loops
      // Consider using a dead letter queue in a production setup
      channel.ack(originalMsg);

      throw error;
    }
  }

  @EventPattern('event_pattern')
  handleEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Received event: ${JSON.stringify(data)}`);

      // Process the event here

      // Acknowledge the message
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Error processing event: ${error.message}`,
        error.stack,
      );

      // Acknowledge the message to prevent redelivery loops
      channel.ack(originalMsg);
    }
  }

  @EventPattern('batch_event')
  handleBatchEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(
        `Received batch event #${data.index}: ${JSON.stringify(data)}`,
      );

      // Simulate processing time (varying based on the message index)
      const processingTime = 100 + data.index * 50;

      // Process the message (simulate async work)
      setTimeout(() => {
        try {
          // Acknowledge the message after processing
          channel.ack(originalMsg);
          this.logger.log(
            `Processed batch event #${data.index} in ${processingTime}ms`,
          );
        } catch (error) {
          this.logger.error(
            `Error acknowledging batch event #${data.index}: ${error.message}`,
            error.stack,
          );
        }
      }, processingTime);
    } catch (error) {
      this.logger.error(
        `Error processing batch event #${data.index}: ${error.message}`,
        error.stack,
      );

      // Acknowledge the message to prevent redelivery loops
      channel.ack(originalMsg);
    }
  }
}
