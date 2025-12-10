import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_EVENTS } from '../../infrastructure/config/rabbitmq-events';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitMQClient: ClientProxy,
  ) {}

  async publishMessageCreated(message: any) {
    return this.rabbitMQClient.emit(RABBITMQ_EVENTS.MESSAGE_CREATED, message);
  }

  async publishMessageRead(messageId: string) {
    return this.rabbitMQClient.emit(RABBITMQ_EVENTS.MESSAGE_READ, {
      messageId,
    });
  }

  async publishOrderAssigned(orderId: string, personalShopperId: string) {
    return this.rabbitMQClient.emit(RABBITMQ_EVENTS.ORDER_ASSIGNED, {
      orderId,
      personalShopperId,
    });
  }

  async publishOrderCompleted(orderId: string, personalShopperId: string) {
    return this.rabbitMQClient.emit(RABBITMQ_EVENTS.ORDER_COMPLETED, {
      orderId,
      personalShopperId,
    });
  }

  async publishPersonalShopperStatusChanged(
    personalShopperId: string,
    status: string,
  ) {
    return this.rabbitMQClient.emit(
      RABBITMQ_EVENTS.PERSONAL_SHOPPER_STATUS_CHANGED,
      {
        personalShopperId,
        status,
      },
    );
  }
}
