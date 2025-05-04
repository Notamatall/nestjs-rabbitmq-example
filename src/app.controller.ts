// src/app.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { RabbitMQService } from './rabbit-mq/rabbit-mq.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('send-message')
  async sendMessage(@Body() body: any) {
    const result = await this.rabbitMQService.sendMessage(
      'message_pattern',
      body,
    );
    return { success: true, result };
  }

  @Post('emit-event')
  async emitEvent(@Body() body: any) {
    await this.rabbitMQService.emitEvent('event_pattern', body);
    return { success: true };
  }
}
