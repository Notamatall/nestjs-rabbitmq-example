// src/microservice/microservice.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { environmentConfig } from '../config/environment.config';
import { Logger } from '@nestjs/common';
import { MessageConsumer } from './rabbitmq/rabbitmq.consumer';

@Module({})
export class MicroserviceModule {
  private static readonly logger = new Logger(MicroserviceModule.name);

  static register(): DynamicModule {
    const providers = [];
    const exports = [];

    // Only register message consumers in local environment
    if (environmentConfig.rabbitmq.registerConsumers) {
      this.logger.log(
        'Registering RabbitMQ message consumers in this environment',
      );
      providers.push(MessageConsumer);
      exports.push(MessageConsumer);
    } else {
      this.logger.log(
        'Message consumers will NOT be registered in this environment',
      );
    }

    return {
      module: MicroserviceModule,
      providers,
      exports,
    };
  }
}
