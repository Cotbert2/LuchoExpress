import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalShopper } from '../../domain/entities/personal-shopper.entity';
import { PersonalShopperStatus } from '../../domain/enums/personal-shopper-status.enum';

@Injectable()
export class PersonalShopperSeeder implements OnModuleInit {
  private readonly logger = new Logger(PersonalShopperSeeder.name);

  constructor(
    @InjectRepository(PersonalShopper)
    private readonly personalShopperRepository: Repository<PersonalShopper>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    try {
      // Personal Shopper from ms-auth seeder
      const psUserId = '821dfbc5-920a-416b-ae40-ad9689c84f25';

      // Check if personal shopper already exists
      const existingPS = await this.personalShopperRepository.findOne({
        where: { userId: psUserId },
      });

      if (existingPS) {
        this.logger.log(
          `Personal Shopper already exists with userId: ${psUserId}`,
        );
        return;
      }

      // Create personal shopper
      const personalShopper = this.personalShopperRepository.create({
        userId: psUserId,
        name: 'Personal Shopper',
        email: 'ps@luchoexpress.com',
        phone: '+34600000001',
        status: PersonalShopperStatus.AVAILABLE,
        activeOrders: 0,
        enabled: true,
      });

      await this.personalShopperRepository.save(personalShopper);

      this.logger.log(
        `✅ Personal Shopper seeded successfully with ID: ${personalShopper.id}`,
      );
    } catch (error) {
      this.logger.error('Error seeding personal shopper:', error.message);
    }
  }
}
