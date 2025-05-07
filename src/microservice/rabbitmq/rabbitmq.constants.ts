// src/rabbitmq/rabbitmq.constants.ts

import { env } from 'process';

const rabbitMqUrl = env.FAST_TRACK_RABBITMQ_URL;
const rabbitMqQueue = env.FAST_TRACK_RABBITMQ_QUEUE_NAME;
export const RABBITMQ_CONNECTION_OPTIONS = {
  urls: [rabbitMqUrl],
  queue: rabbitMqQueue,
  queueOptions: {
    durable: true,
    arguments: {
      'x-queue-type': 'classic',
    },
  },
  prefetchCount: 1,
  isGlobalPrefetchCount: false,
  noAck: false,
  persistent: true,
};
