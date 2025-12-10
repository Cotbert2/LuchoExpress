import { Message } from '../../domain/entities/message.entity';
import { CreateMessageDto } from '../dtos/message.dto';

export interface IMessageRepository {
  create(data: CreateMessageDto): Promise<Message>;
  findByOrderId(orderId: string): Promise<Message[]>;
  findByCustomerId(customerId: string): Promise<Message[]>;
  findByPersonalShopperId(personalShopperId: string): Promise<Message[]>;
  findById(id: string): Promise<Message | null>;
  markAsRead(id: string): Promise<void>;
  findUnreadByCustomerId(customerId: string): Promise<Message[]>;
  findUnreadByPersonalShopperId(personalShopperId: string): Promise<Message[]>;
}
