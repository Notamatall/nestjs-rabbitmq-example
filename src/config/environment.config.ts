// src/config/environment.config.ts
import * as dotenv from 'dotenv';

dotenv.config();

export const environmentConfig = {
  environment: process.env.NODE_ENV || 'development',
  isLocal:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local',
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'main_queue',
    registerConsumers:
      process.env.REGISTER_CONSUMERS === 'true' ||
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'local',
  },
};
