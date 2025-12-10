import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../../domain/entities/message.entity';
import { IMessageRepository } from '../../../application/interfaces/message-repository.interface';
import { CreateMessageDto } from '../../../application/dtos/message.dto';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,
  ) {}

  async create(data: CreateMessageDto): Promise<Message> {
    const message = this.repository.create(data);
    return await this.repository.save(message);
  }

  async findByOrderId(orderId: string): Promise<Message[]> {
    return await this.repository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByCustomerId(customerId: string): Promise<Message[]> {
    return await this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPersonalShopperId(personalShopperId: string): Promise<Message[]> {
    return await this.repository.find({
      where: { personalShopperId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Message | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async markAsRead(id: string): Promise<void> {
    await this.repository.update(id, { isRead: true });
  }

  async findUnreadByCustomerId(customerId: string): Promise<Message[]> {
    return await this.repository.find({
      where: { customerId, isRead: false },
      order: { createdAt: 'ASC' },
    });
  }

  async findUnreadByPersonalShopperId(
    personalShopperId: string,
  ): Promise<Message[]> {
    return await this.repository.find({
      where: { personalShopperId, isRead: false },
      order: { createdAt: 'ASC' },
    });
  }
}
