import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IMessageRepository } from '../interfaces/message-repository.interface';
import {
  CreateMessageDto,
  MessageResponseDto,
} from '../dtos/message.dto';
import { Message } from '../../domain/entities/message.entity';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class MessageService {
  constructor(
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(data: CreateMessageDto): Promise<MessageResponseDto> {
    const message = await this.messageRepository.create(data);
    
    // Publish event to RabbitMQ for real-time notifications
    await this.rabbitMQService.publishMessageCreated(this.toResponseDto(message));
    
    return this.toResponseDto(message);
  }

  async findByOrderId(orderId: string): Promise<MessageResponseDto[]> {
    const messages = await this.messageRepository.findByOrderId(orderId);
    return messages.map((m) => this.toResponseDto(m));
  }

  async findByCustomerId(customerId: string): Promise<MessageResponseDto[]> {
    const messages = await this.messageRepository.findByCustomerId(customerId);
    return messages.map((m) => this.toResponseDto(m));
  }

  async findByPersonalShopperId(
    personalShopperId: string,
  ): Promise<MessageResponseDto[]> {
    const messages =
      await this.messageRepository.findByPersonalShopperId(personalShopperId);
    return messages.map((m) => this.toResponseDto(m));
  }

  async markAsRead(messageId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }
    await this.messageRepository.markAsRead(messageId);
    
    // Publish event to RabbitMQ
    await this.rabbitMQService.publishMessageRead(messageId);
  }

  async findUnreadByCustomerId(
    customerId: string,
  ): Promise<MessageResponseDto[]> {
    const messages =
      await this.messageRepository.findUnreadByCustomerId(customerId);
    return messages.map((m) => this.toResponseDto(m));
  }

  async findUnreadByPersonalShopperId(
    personalShopperId: string,
  ): Promise<MessageResponseDto[]> {
    const messages =
      await this.messageRepository.findUnreadByPersonalShopperId(
        personalShopperId,
      );
    return messages.map((m) => this.toResponseDto(m));
  }

  private toResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      orderId: message.orderId,
      customerId: message.customerId,
      personalShopperId: message.personalShopperId,
      content: message.content,
      type: message.type,
      senderId: message.senderId,
      senderType: message.senderType,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };
  }
}
