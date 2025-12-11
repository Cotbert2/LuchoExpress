import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonTextarea,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, arrowBackOutline } from 'ionicons/icons';
import { io, Socket } from 'socket.io-client';
import { PersonalShopperService } from '../../services/personal-shopper.service';
import { AuthService } from '../../services/auth.service';
import { Message, CreateMessageDto, MessageType, Order } from '../../interfaces/personal-shopper.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonFooter,
    IonTextarea,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonBadge
  ]
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('chatContent') chatContent!: ElementRef;
  
  orderId: string = '';
  order: Order | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  loading = true;
  sending = false;
  
  private socket: Socket | null = null;
  private currentUserId: string = '';
  private personalShopperId: string = '';

  constructor(
    private route: ActivatedRoute,
    private psService: PersonalShopperService,
    private authService: AuthService
  ) {
    addIcons({ sendOutline, arrowBackOutline });
  }

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.orderId = orderId;
      this.initializeChat();
    }
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  async initializeChat() {
    try {
      // Get current user
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUserId = user.id;
          
          // Check if user is a personal shopper
          if (this.authService.isPersonalShopper()) {
            this.loadPersonalShopperInfo();
          } else {
            // For customers, connect directly to socket
            this.connectToSocket();
          }
        }
      });

      // Load order details
      this.psService.getOrderById(this.orderId).subscribe({
        next: (order) => {
          this.order = order;
          this.loadMessages();
        },
        error: (err) => console.error('Error loading order:', err)
      });
    } catch (error) {
      console.error('Error initializing chat:', error);
      this.loading = false;
    }
  }

  loadPersonalShopperInfo() {
    this.psService.getPersonalShopperByUserId(this.currentUserId).subscribe({
      next: (ps) => {
        this.personalShopperId = ps.id;
        this.connectToSocket();
      },
      error: (err) => console.error('Error loading personal shopper:', err)
    });
  }

  loadMessages() {
    this.psService.getOrderMessages(this.orderId).subscribe({
      next: (messages) => {
        this.messages = messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.loading = false;
      }
    });
  }

  connectToSocket() {
    // Connect directly to ms-chat for WebSocket (bypass API Gateway)
    this.socket = io(environment.chatSocketUrl || 'http://localhost:3000', {
      transports: ['websocket'],
      auth: {
        token: this.authService.getToken()
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      if (this.socket) {
        // Register user (personal shopper or customer)
        const isPS = this.authService.isPersonalShopper();
        this.socket.emit('register', { 
          userId: isPS ? this.personalShopperId : this.currentUserId, 
          role: isPS ? 'personal-shopper' : 'customer'
        });
        this.socket.emit('joinOrder', { orderId: this.orderId });
      }
    });

    this.socket.on('newMessage', (message: Message) => {
      if (message.orderId === this.orderId) {
        this.messages.push(message);
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.order) {
      return;
    }

    const isPS = this.authService.isPersonalShopper();
    
    // For customers, get personalShopperId from order
    const psId = isPS ? this.personalShopperId : this.order.personalShopperId;
    
    if (!psId) {
      console.error('No personal shopper assigned to this order');
      return;
    }

    this.sending = true;
    const messageDto: CreateMessageDto = {
      orderId: this.orderId,
      customerId: this.order.customerId,
      personalShopperId: psId,
      content: this.newMessage.trim(),
      type: MessageType.TEXT,
      senderType: isPS ? 'personal-shopper' : 'customer',
      senderId: isPS ? this.personalShopperId : this.currentUserId,
      senderName: this.getUserName()
    };

    // Emit via socket
    if (this.socket) {
      this.socket.emit('sendMessage', messageDto);
    }

    // Also save via HTTP as backup
    this.psService.sendMessage(messageDto).subscribe({
      next: (message) => {
        if (!this.messages.find(m => m.id === message.id)) {
          this.messages.push(message);
        }
        this.newMessage = '';
        this.sending = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.sending = false;
      }
    });
  }

  scrollToBottom() {
    if (this.chatContent) {
      const element = this.chatContent.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  isMyMessage(message: Message): boolean {
    const isPS = this.authService.isPersonalShopper();
    return message.senderId === (isPS ? this.personalShopperId : this.currentUserId);
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Hoy';
    }
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  }

  shouldShowDateDivider(index: number): boolean {
    if (index === 0) return true;
    
    const currentMsg = this.messages[index];
    const prevMsg = this.messages[index - 1];
    
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    
    return currentDate !== prevDate;
  }

  getUserName(): string {
    let username = 'Personal Shopper';
    this.authService.currentUser$.subscribe(user => {
      if (user) username = user.username;
    });
    return username;
  }
}
