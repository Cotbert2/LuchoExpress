import { PersonalShopper } from '../../domain/entities/personal-shopper.entity';
import { CreatePersonalShopperDto, UpdatePersonalShopperDto } from '../dtos/personal-shopper.dto';

export interface IPersonalShopperRepository {
  create(data: CreatePersonalShopperDto): Promise<PersonalShopper>;
  findAll(): Promise<PersonalShopper[]>;
  findById(id: string): Promise<PersonalShopper | null>;
  findByUserId(userId: string): Promise<PersonalShopper | null>;
  findByEmail(email: string): Promise<PersonalShopper | null>;
  findAvailable(): Promise<PersonalShopper[]>;
  update(id: string, data: UpdatePersonalShopperDto): Promise<PersonalShopper>;
  delete(id: string): Promise<void>;
  incrementActiveOrders(id: string): Promise<void>;
  decrementActiveOrders(id: string): Promise<void>;
}
