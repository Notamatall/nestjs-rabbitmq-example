// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from './microservice/rabbitmq/rabbitmq.module';
import { MicroserviceModule } from './microservice/microservice.module';

@Module({
  imports: [RabbitMQModule, MicroserviceModule.register()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
