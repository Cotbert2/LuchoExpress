import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Order, 
  UpdateOrderStatusRequest, 
  PersonalShopper, 
  Message,
  CreateMessageDto 
} from '../interfaces/personal-shopper.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PersonalShopperService {
  private readonly ORDERS_API = `${environment.ordersUrl}/orders`;
  private readonly PS_API = `${environment.apiUrl}/api/personal-shoppers`;
  private readonly MESSAGES_API = `${environment.apiUrl}/api/messages`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get all orders assigned to the authenticated personal shopper
   */
  getMyOrders(): Observable<Order[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Order[]>(`${this.ORDERS_API}/personal-shopper/my-orders`, { headers });
  }

  /**
   * Get order details by ID
   */
  getOrderById(orderId: string): Observable<Order> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Order>(`${this.ORDERS_API}/${orderId}`, { headers });
  }

  /**
   * Update order status (PENDING -> CONFIRMED -> SHIPPED -> DELIVERED)
   */
  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    const headers = this.authService.getAuthHeaders();
    const request: UpdateOrderStatusRequest = { status: status as any };
    return this.http.patch<Order>(`${this.ORDERS_API}/${orderId}/status`, request, { headers });
  }

  /**
   * Get personal shopper info by user ID
   */
  getPersonalShopperByUserId(userId: string): Observable<PersonalShopper> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<PersonalShopper>(`${this.PS_API}/by-user/${userId}`, { headers });
  }

  /**
   * Get chat messages for a specific order
   */
  getOrderMessages(orderId: string): Observable<Message[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Message[]>(`${this.MESSAGES_API}/order/${orderId}`, { headers });
  }

  /**
   * Send a message to the customer
   */
  sendMessage(messageDto: CreateMessageDto): Observable<Message> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<Message>(this.MESSAGES_API, messageDto, { headers });
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.patch<void>(`${this.MESSAGES_API}/${messageId}/read`, {}, { headers });
  }
}
