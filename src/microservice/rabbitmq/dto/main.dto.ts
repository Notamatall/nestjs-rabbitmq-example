// src/rabbitmq/dto/message.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    description: 'The message text to be sent via RabbitMQ',
    example: 'Hello RabbitMQ!',
  })
  text: string;

  @ApiProperty({
    description: 'Additional metadata for the message (optional)',
    example: { priority: 'high', tags: ['notification', 'test'] },
    required: false,
  })
  metadata?: Record<string, any>;
}

export class EventDto {
  @ApiProperty({
    description: 'The event name or description',
    example: 'user.created',
  })
  event: string;

  @ApiProperty({
    description: 'Event payload data',
    example: { userId: '123', action: 'signup' },
  })
  data: Record<string, any>;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'The result returned from the message handler',
    example: { received: true, data: { text: 'Hello RabbitMQ!' } },
  })
  result: any;
}

export class EventResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;
}

export class QueueMessageResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Details about the queued message',
    example: {
      queued: true,
      timestamp: '2025-05-04T15:49:55.123Z',
    },
  })
  result: {
    queued: boolean;
    timestamp: string;
    info?: string;
  };
}

export class BatchEventDto {
  @ApiProperty({
    description: 'The batch of events to be processed',
    example: [
      { event: 'user.created', data: { userId: '123', action: 'signup' } },
      { event: 'notification.sent', data: { userId: '123', type: 'email' } },
    ],
  })
  events: EventDto[];

  @ApiProperty({
    description: 'Batch processing options',
    example: { ordered: true, maxConcurrent: 5 },
    required: false,
  })
  options?: {
    ordered?: boolean;
    maxConcurrent?: number;
    priority?: string;
  };
}

export class BatchResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'The size of the batch',
    example: 10,
  })
  batchSize: number;

  @ApiProperty({
    description: 'Details about individual message results',
    example: [
      { index: 0, status: 'sent' },
      { index: 1, status: 'sent' },
      { index: 2, status: 'failed', error: 'Invalid format' },
    ],
  })
  results: Array<{
    index: number;
    status: string;
    error?: string;
  }>;
}

export class RabbitMQHealthDto {
  @ApiProperty({
    description: 'Health status of the RabbitMQ connection',
    example: 'ok',
    enum: ['ok', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Detailed information about the queue',
    example: {
      queue: 'main_queue',
      messageCount: 5,
      consumerCount: 2,
    },
  })
  details?: Record<string, any>;
}
