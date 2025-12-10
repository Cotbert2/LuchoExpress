import { IsUUID } from 'class-validator';

export class ReassignPersonalShopperDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  newPersonalShopperId: string;
}
