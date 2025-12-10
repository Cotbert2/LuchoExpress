import { Injectable } from '@nestjs/common';
import { PersonalShopperService } from './personal-shopper.service';
import { PersonalShopperResponseDto } from '../dtos/personal-shopper.dto';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class PersonalShopperAssignmentService {
  constructor(
    private readonly personalShopperService: PersonalShopperService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async assignAvailablePersonalShopper(): Promise<PersonalShopperResponseDto> {
    const availableShoppers =
      await this.personalShopperService.findAvailable();

    if (availableShoppers.length === 0) {
      throw new Error('No personal shoppers available at the moment');
    }

    // Get the one with least active orders
    const selectedShopper = availableShoppers[0];

    // Increment their active orders
    await this.personalShopperService.assignToOrder(selectedShopper.id);

    return selectedShopper;
  }

  async reassignPersonalShopper(
    orderId: string,
    newPersonalShopperId: string,
  ): Promise<PersonalShopperResponseDto> {
    // Get the new personal shopper
    const newShopper = await this.personalShopperService.findById(
      newPersonalShopperId,
    );

    // Assign to the new personal shopper
    await this.personalShopperService.assignToOrder(newPersonalShopperId);

    // Publish event to RabbitMQ
    await this.rabbitMQService.publishOrderAssigned(
      orderId,
      newPersonalShopperId,
    );

    return newShopper;
  }

  async unassignPersonalShopperFromOrder(
    personalShopperId: string,
    orderId: string,
  ): Promise<void> {
    // Decrement active orders
    await this.personalShopperService.unassignFromOrder(personalShopperId);

    // Publish event to RabbitMQ
    await this.rabbitMQService.publishOrderCompleted(orderId, personalShopperId);
  }
}
