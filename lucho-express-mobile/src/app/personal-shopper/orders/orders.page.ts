import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonRefresher, 
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cartOutline, 
  timeOutline, 
  checkmarkCircleOutline,
  arrowForwardOutline,
  refreshOutline,
  personOutline,
  cashOutline
} from 'ionicons/icons';
import { PersonalShopperService } from '../../services/personal-shopper.service';
import { Order, OrderStatus } from '../../interfaces/personal-shopper.interface';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonChip
  ]
})
export class OrdersPage implements OnInit {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private psService: PersonalShopperService,
    private router: Router
  ) {
    addIcons({ 
      cartOutline, 
      timeOutline, 
      checkmarkCircleOutline,
      arrowForwardOutline,
      refreshOutline,
      personOutline,
      cashOutline
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(event?: any) {
    this.loading = true;
    this.error = null;

    this.psService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => {
          // Sort by status priority and then by date
          const statusPriority = {
            [OrderStatus.PENDING]: 1,
            [OrderStatus.CONFIRMED]: 2,
            [OrderStatus.SHIPPED]: 3,
            [OrderStatus.DELIVERED]: 4,
            [OrderStatus.CANCELLED]: 5
          };
          
          const priorityDiff = (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
          if (priorityDiff !== 0) return priorityDiff;
          
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'No se pudieron cargar las órdenes';
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  viewOrderDetail(orderId: string) {
    // Navigate to chat page to communicate with customer
    this.router.navigate(['/personal-shopper/chat', orderId]);
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'warning',
      [OrderStatus.CONFIRMED]: 'primary',
      [OrderStatus.SHIPPED]: 'secondary',
      [OrderStatus.DELIVERED]: 'success',
      [OrderStatus.CANCELLED]: 'danger'
    };
    return colors[status] || 'medium';
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pendiente',
      [OrderStatus.CONFIRMED]: 'Confirmado',
      [OrderStatus.SHIPPED]: 'Enviado',
      [OrderStatus.DELIVERED]: 'Entregado',
      [OrderStatus.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: OrderStatus): string {
    const icons: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'time-outline',
      [OrderStatus.CONFIRMED]: 'checkmark-circle-outline',
      [OrderStatus.SHIPPED]: 'arrow-forward-outline',
      [OrderStatus.DELIVERED]: 'checkmark-circle-outline',
      [OrderStatus.CANCELLED]: 'close-circle-outline'
    };
    return icons[status] || 'cart-outline';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
