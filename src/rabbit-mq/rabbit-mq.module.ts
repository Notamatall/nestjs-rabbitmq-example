// src/rabbitmq/rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbit-mq.service';
import { RabbitMQHealthService } from './rabbit-mq.health-service';
import { MessageConsumer } from './rabbit-mq.consumer';
import { RABBITMQ_CONNECTION_OPTIONS } from './rabbit-mq.constants';
import { IsLocal } from 'src/utils';

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
  controllers: [MessageConsumer],
  providers: [RabbitMQService, RabbitMQHealthService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
