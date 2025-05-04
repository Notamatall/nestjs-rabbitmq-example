// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RABBITMQ_CONNECTION_OPTIONS } from './microservice/rabbitmq/rabbitmq.constants';
import { Logger } from '@nestjs/common';
import { environmentConfig } from './config/environment.config';
import { env } from 'process';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Create main HTTP application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Only connect as a microservice if we need to register consumers
    if (environmentConfig.rabbitmq.registerConsumers) {
      logger.log(
        'Registering as a RabbitMQ microservice for message consumption',
      );

      // Connect the application as a microservice to listen for messages
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
          ...RABBITMQ_CONNECTION_OPTIONS,
          // Add these options to ensure message patterns are properly registered
          noAck: false,
          prefetchCount: 1,
          isGlobalPrefetchCount: false,
        },
      });

      // Start the microservice
      await app.startAllMicroservices();
      logger.log('Microservice successfully started');
    } else {
      logger.log(
        'This instance will not consume messages from RabbitMQ (external consumers will be used)',
      );
    }

    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('NestJS RabbitMQ API')
      .setDescription('API documentation for NestJS RabbitMQ integration')
      .setVersion('1.0')
      .addTag('messages')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Start the HTTP server
    await app.listen(env.PORT);
    logger.log(
      `Application is running in ${environmentConfig.environment} environment`,
    );
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(
      `Swagger documentation is available at: ${await app.getUrl()}/api`,
    );
  } catch (error) {
    logger.error(
      `Error during application bootstrap: ${error.message}`,
      error.stack,
    );
    process.exit(1);
  }
}
bootstrap();
