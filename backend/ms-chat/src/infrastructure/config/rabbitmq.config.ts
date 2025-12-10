import { ClientOptions, Transport } from '@nestjs/microservices';

export const rabbitmqConfig: ClientOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: process.env.RABBITMQ_QUEUE || 'chat_queue',
    queueOptions: {
      durable: true,
    },
  },
};
