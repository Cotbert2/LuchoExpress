import { IsString, IsEmail, IsEnum, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { PersonalShopperStatus } from '../../domain/enums/personal-shopper-status.enum';

export class CreatePersonalShopperDto {
  @IsUUID()
  userId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdatePersonalShopperDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(PersonalShopperStatus)
  @IsOptional()
  status?: PersonalShopperStatus;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class PersonalShopperResponseDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: PersonalShopperStatus;
  activeOrders: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
