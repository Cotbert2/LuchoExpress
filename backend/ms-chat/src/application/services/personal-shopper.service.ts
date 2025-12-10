import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import type { IPersonalShopperRepository } from '../interfaces/personal-shopper-repository.interface';
import {
  CreatePersonalShopperDto,
  UpdatePersonalShopperDto,
  PersonalShopperResponseDto,
} from '../dtos/personal-shopper.dto';
import { PersonalShopper } from '../../domain/entities/personal-shopper.entity';

@Injectable()
export class PersonalShopperService {
  constructor(
    @Inject('IPersonalShopperRepository')
    private readonly personalShopperRepository: IPersonalShopperRepository,
  ) {}

  async create(
    data: CreatePersonalShopperDto,
  ): Promise<PersonalShopperResponseDto> {
    // Check if email already exists
    const existingByEmail =
      await this.personalShopperRepository.findByEmail(data.email);
    if (existingByEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if userId already exists
    const existingByUserId =
      await this.personalShopperRepository.findByUserId(data.userId);
    if (existingByUserId) {
      throw new ConflictException('User already has a personal shopper profile');
    }

    const personalShopper = await this.personalShopperRepository.create(data);
    return this.toResponseDto(personalShopper);
  }

  async findAll(): Promise<PersonalShopperResponseDto[]> {
    const personalShoppers = await this.personalShopperRepository.findAll();
    return personalShoppers.map((ps) => this.toResponseDto(ps));
  }

  async findById(id: string): Promise<PersonalShopperResponseDto> {
    const personalShopper = await this.personalShopperRepository.findById(id);
    if (!personalShopper) {
      throw new NotFoundException(`Personal shopper with ID ${id} not found`);
    }
    return this.toResponseDto(personalShopper);
  }

  async findByUserId(userId: string): Promise<PersonalShopperResponseDto> {
    const personalShopper =
      await this.personalShopperRepository.findByUserId(userId);
    if (!personalShopper) {
      throw new NotFoundException(
        `Personal shopper with user ID ${userId} not found`,
      );
    }
    return this.toResponseDto(personalShopper);
  }

  async findAvailable(): Promise<PersonalShopperResponseDto[]> {
    const personalShoppers =
      await this.personalShopperRepository.findAvailable();
    return personalShoppers.map((ps) => this.toResponseDto(ps));
  }

  async update(
    id: string,
    data: UpdatePersonalShopperDto,
  ): Promise<PersonalShopperResponseDto> {
    const personalShopper = await this.personalShopperRepository.findById(id);
    if (!personalShopper) {
      throw new NotFoundException(`Personal shopper with ID ${id} not found`);
    }

    const updated = await this.personalShopperRepository.update(id, data);
    return this.toResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const personalShopper = await this.personalShopperRepository.findById(id);
    if (!personalShopper) {
      throw new NotFoundException(`Personal shopper with ID ${id} not found`);
    }
    await this.personalShopperRepository.delete(id);
  }

  async assignToOrder(id: string): Promise<void> {
    await this.personalShopperRepository.incrementActiveOrders(id);
  }

  async unassignFromOrder(id: string): Promise<void> {
    await this.personalShopperRepository.decrementActiveOrders(id);
  }

  private toResponseDto(
    personalShopper: PersonalShopper,
  ): PersonalShopperResponseDto {
    return {
      id: personalShopper.id,
      userId: personalShopper.userId,
      name: personalShopper.name,
      email: personalShopper.email,
      phone: personalShopper.phone,
      status: personalShopper.status,
      activeOrders: personalShopper.activeOrders,
      enabled: personalShopper.enabled,
      createdAt: personalShopper.createdAt,
      updatedAt: personalShopper.updatedAt,
    };
  }
}
