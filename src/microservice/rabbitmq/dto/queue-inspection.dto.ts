// src/rabbitmq/dto/queue-inspection.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class QueueInfoDto {
  @ApiProperty({
    description: 'Name of the queue',
    example: 'main_queue',
  })
  name: string;

  @ApiProperty({
    description: 'Number of messages in the queue',
    example: 5,
  })
  messageCount: number;

  @ApiProperty({
    description: 'Number of consumers connected to the queue',
    example: 2,
  })
  consumerCount: number;

  @ApiProperty({
    description: 'Additional properties of the queue',
    example: {
      durable: true,
      autoDelete: false,
      exclusive: false,
    },
  })
  properties: {
    durable: boolean;
    autoDelete: boolean;
    exclusive: boolean;
  };
}

export class MessageContentDto {
  @ApiProperty({
    description: 'Unique identifier for the message',
    example: 'msg-1',
  })
  messageId: string;

  @ApiProperty({
    description: 'Timestamp when the message was published',
    example: '2025-05-04T16:30:45.123Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Routing key used for the message',
    example: 'message_pattern',
  })
  routingKey: string;

  @ApiProperty({
    description: 'Exchange the message was published to',
    example: 'amq.topic',
  })
  exchange: string;

  @ApiProperty({
    description: 'The message content/payload',
    example: {
      text: 'Hello RabbitMQ!',
      metadata: {
        priority: 'high',
        tags: ['notification', 'test'],
      },
    },
  })
  content: any;

  @ApiProperty({
    description: 'Message properties and headers',
    example: {
      contentType: 'application/json',
      contentEncoding: 'utf-8',
      headers: {
        'x-custom-header': 'value',
      },
    },
  })
  properties: Record<string, any>;
}

export class PurgeQueueResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Number of messages purged from the queue',
    example: 15,
  })
  purgedCount: number;

  @ApiProperty({
    description: 'Name of the queue that was purged',
    example: 'main_queue',
  })
  queueName: string;
}

export class QueueInspectionQueryDto {
  @ApiProperty({
    description: 'Name of the queue to inspect',
    example: 'main_queue',
    required: false,
  })
  queueName?: string;

  @ApiProperty({
    description: 'Maximum number of messages to peek at',
    example: 10,
    required: false,
  })
  count?: number;
}
