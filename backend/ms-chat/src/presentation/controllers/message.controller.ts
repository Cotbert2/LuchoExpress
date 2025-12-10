import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessageService } from '../../application/services/message.service';
import {
  CreateMessageDto,
  MessageResponseDto,
} from '../../application/dtos/message.dto';

@Controller('api/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    return await this.messageService.create(createDto);
  }

  @Get('order/:orderId')
  async findByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<MessageResponseDto[]> {
    return await this.messageService.findByOrderId(orderId);
  }

  @Get('customer/:customerId')
  async findByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<MessageResponseDto[]> {
    return await this.messageService.findByCustomerId(customerId);
  }

  @Get('personal-shopper/:personalShopperId')
  async findByPersonalShopperId(
    @Param('personalShopperId') personalShopperId: string,
  ): Promise<MessageResponseDto[]> {
    return await this.messageService.findByPersonalShopperId(
      personalShopperId,
    );
  }

  @Get('customer/:customerId/unread')
  async findUnreadByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<MessageResponseDto[]> {
    return await this.messageService.findUnreadByCustomerId(customerId);
  }

  @Get('personal-shopper/:personalShopperId/unread')
  async findUnreadByPersonalShopperId(
    @Param('personalShopperId') personalShopperId: string,
  ): Promise<MessageResponseDto[]> {
    return await this.messageService.findUnreadByPersonalShopperId(
      personalShopperId,
    );
  }

  @Patch(':messageId/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('messageId') messageId: string,
  ): Promise<{ message: string }> {
    await this.messageService.markAsRead(messageId);
    return { message: 'Message marked as read' };
  }
}
