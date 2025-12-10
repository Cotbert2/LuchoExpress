import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessageService } from '../../application/services/message.service';
import { CreateMessageDto } from '../../application/dtos/message.dto';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:4200',
      'http://localhost:8100',
      'http://127.0.0.1:4200',
      'http://127.0.0.1:8100',
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);
  private activeConnections = new Map<string, string>(); // userId -> socketId

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove from active connections
    for (const [userId, socketId] of this.activeConnections.entries()) {
      if (socketId === client.id) {
        this.activeConnections.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`User ${data.userId} registered with socket ${client.id}`);
    this.activeConnections.set(data.userId, client.id);
    return { event: 'registered', data: { success: true } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Received message from ${createMessageDto.senderId}`);

      // Save message to database
      const savedMessage = await this.messageService.create(createMessageDto);

      // Emit to the order room (all participants in this order)
      this.server
        .to(`order:${createMessageDto.orderId}`)
        .emit('newMessage', savedMessage);

      // Also send directly to recipient if they're connected
      const recipientId =
        createMessageDto.senderType === 'CUSTOMER'
          ? createMessageDto.personalShopperId
          : createMessageDto.customerId;

      const recipientSocketId = this.activeConnections.get(recipientId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('newMessage', savedMessage);
      }

      return { event: 'messageSent', data: savedMessage };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('joinOrder')
  handleJoinOrder(
    @MessageBody() data: { orderId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `order:${data.orderId}`;
    client.join(roomName);
    this.logger.log(`User ${data.userId} joined order room: ${roomName}`);
    return { event: 'joinedOrder', data: { orderId: data.orderId } };
  }

  @SubscribeMessage('leaveOrder')
  handleLeaveOrder(
    @MessageBody() data: { orderId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `order:${data.orderId}`;
    client.leave(roomName);
    this.logger.log(`User ${data.userId} left order room: ${roomName}`);
    return { event: 'leftOrder', data: { orderId: data.orderId } };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.messageService.markAsRead(data.messageId);
      this.logger.log(`Message ${data.messageId} marked as read`);
      return { event: 'messageRead', data: { messageId: data.messageId } };
    } catch (error) {
      this.logger.error(`Error marking message as read: ${error.message}`);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { orderId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `order:${data.orderId}`;
    // Broadcast to all users in the order except the sender
    client.to(roomName).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  // Method to send notifications from other services
  sendNotification(userId: string, notification: any) {
    const socketId = this.activeConnections.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }
}
