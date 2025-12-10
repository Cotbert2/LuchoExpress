import { IsUUID } from 'class-validator';

export class UnassignPersonalShopperDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  personalShopperId: string;
}

export class ReassignFromOrderDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  oldPersonalShopperId: string;

  @IsUUID()
  newPersonalShopperId: string;
}
