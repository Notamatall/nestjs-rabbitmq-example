import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RABBITMQ_CONNECTION_OPTIONS } from './rabbit-mq/rabbit-mq.constants';
import { env } from 'process';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connect the application as a microservice to listen for messages
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: RABBITMQ_CONNECTION_OPTIONS,
  });
  console.log(env.NODE_ENV);
  await app.startAllMicroservices();

  await app.listen(env.PORT);
}
bootstrap();
