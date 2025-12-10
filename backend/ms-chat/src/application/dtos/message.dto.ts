import { IsString, IsEnum, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { MessageType } from '../../domain/enums/message-type.enum';

export class CreateMessageDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  personalShopperId: string;

  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsUUID()
  senderId: string;

  @IsString()
  senderType: string; // 'CUSTOMER' or 'PERSONAL_SHOPPER'
}

export class MessageResponseDto {
  id: string;
  orderId: string;
  customerId: string;
  personalShopperId: string;
  content: string;
  type: MessageType;
  senderId: string;
  senderType: string;
  isRead: boolean;
  createdAt: Date;
}

export class MarkMessageAsReadDto {
  @IsUUID()
  messageId: string;
}
