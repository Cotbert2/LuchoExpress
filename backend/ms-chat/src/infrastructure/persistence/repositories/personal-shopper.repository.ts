import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalShopper } from '../../../domain/entities/personal-shopper.entity';
import { IPersonalShopperRepository } from '../../../application/interfaces/personal-shopper-repository.interface';
import {
  CreatePersonalShopperDto,
  UpdatePersonalShopperDto,
} from '../../../application/dtos/personal-shopper.dto';
import { PersonalShopperStatus } from '../../../domain/enums/personal-shopper-status.enum';

@Injectable()
export class PersonalShopperRepository implements IPersonalShopperRepository {
  constructor(
    @InjectRepository(PersonalShopper)
    private readonly repository: Repository<PersonalShopper>,
  ) {}

  async create(data: CreatePersonalShopperDto): Promise<PersonalShopper> {
    const personalShopper = this.repository.create(data);
    return await this.repository.save(personalShopper);
  }

  async findAll(): Promise<PersonalShopper[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PersonalShopper | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<PersonalShopper | null> {
    return await this.repository.findOne({ where: { userId } });
  }

  async findByEmail(email: string): Promise<PersonalShopper | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findAvailable(): Promise<PersonalShopper[]> {
    return await this.repository.find({
      where: {
        status: PersonalShopperStatus.AVAILABLE,
        enabled: true,
      },
      order: { activeOrders: 'ASC' },
    });
  }

  async update(
    id: string,
    data: UpdatePersonalShopperDto,
  ): Promise<any> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async incrementActiveOrders(id: string): Promise<void> {
    await this.repository.increment({ id }, 'activeOrders', 1);
  }

  async decrementActiveOrders(id: string): Promise<void> {
    await this.repository.decrement({ id }, 'activeOrders', 1);
  }
}
