// src/app.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { environmentConfig } from './config/environment.config';
import { RabbitMQService } from './microservice/rabbitmq/rabbitmq.service';
import {
  MessageResponseDto,
  MessageDto,
  EventResponseDto,
  EventDto,
} from './microservice/rabbitmq/dto/main.dto';

@ApiTags('messages')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Post('send-message')
  @ApiOperation({
    summary: 'Send a message to RabbitMQ using request-response pattern',
  })
  @ApiResponse({
    status: 201,
    description: 'The message has been successfully sent and processed',
    type: MessageResponseDto,
  })
  async sendMessage(
    @Body() messageDto: MessageDto,
  ): Promise<MessageResponseDto> {
    if (environmentConfig.rabbitmq.registerConsumers) {
      // If consumers are registered, use request-response pattern
      const result = await this.rabbitMQService.sendMessage(
        'message_pattern',
        messageDto,
      );
      return { success: true, result };
    } else {
      // If no consumers are registered, just queue the message without waiting for response
      await this.rabbitMQService.emitEvent('message_pattern', messageDto);
      return {
        success: true,
        result: {
          queued: true,
          info: 'Message has been queued for processing by external consumers',
        },
      };
    }
  }

  @Post('emit-event')
  @ApiOperation({
    summary: 'Emit an event to RabbitMQ using publish-subscribe pattern',
  })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully emitted',
    type: EventResponseDto,
  })
  async emitEvent(@Body() eventDto: EventDto): Promise<EventResponseDto> {
    await this.rabbitMQService.emitEvent('event_pattern', eventDto);
    return { success: true };
  }
}
