// src/rabbitmq/rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQHealthService } from './rabbitmq.health-service';
import { RABBITMQ_CONNECTION_OPTIONS } from './rabbitmq.constants';
import { QueueInspectionController } from './queue-inspection.controller';
import { QueueInspectionService } from './rabbitmq.queue-inspection.service';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: RABBITMQ_CONNECTION_OPTIONS.urls,
          queue: RABBITMQ_CONNECTION_OPTIONS.queue,
          queueOptions: RABBITMQ_CONNECTION_OPTIONS.queueOptions,
        },
      },
    ]),
  ],
  controllers: [QueueInspectionController],
  providers: [RabbitMQService, RabbitMQHealthService, QueueInspectionService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
