// src/rabbitmq/rabbitmq.constants.ts
export const RABBITMQ_CONNECTION_OPTIONS = {
  urls: ['amqp://rabbitmq:rabbitmq@localhost:5672'],
  queue: 'main_queue',
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
