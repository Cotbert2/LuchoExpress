import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  ToastController, 
    AlertController, 
    ModalController,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSegmentButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
    IonTitle,
    IonChip,
    IonLabel,
    IonContent,
    IonList,
    IonItem,
    IonItemDivider,
    IonProgressBar,
    IonSegment,
    IonNote,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonTextarea,
    IonText,
    IonSkeletonText,
    IonDatetimeButton,
    IonModal
 } from '@ionic/angular/standalone';

import { ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  cartOutline, 
  refreshOutline, 
  closeOutline, 
  flashOutline,
  calendarOutline,
  searchOutline,
  cubeOutline,
  checkmarkCircle,
  timeOutline,
  closeCircle,
  chatbubbleOutline
} from 'ionicons/icons';
import { OrderService, OrderResponse } from '../../services/order.service';
import { TrackingService } from '../../services/tracking.service';
import { AuthService } from '../../services/auth.service';
import { OrderStatus } from '../../interfaces/order.interface';
import { TrackingStatus, TrackingResponse, OrderStatusEnum } from '../../interfaces/tracking.interface';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
      IonHeader,
      IonToolbar,
      IonButtons,
      IonBackButton,
      IonSegmentButton,
      IonCard,
      IonCardHeader,
      IonCardTitle,
      IonCardContent,
      IonCardSubtitle,
      IonTitle,
      IonDatetimeButton,
      IonSkeletonText,
      IonChip,
      IonLabel,
      IonContent,
      IonList,
      IonItem,
      IonItemDivider,
      IonProgressBar,
      IonSegment,
      IonNote,
      IonInput,
      IonButton,
      IonIcon,
      IonSpinner,
      IonTextarea,
      IonText,
      IonModal
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, ViewWillEnter {
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  loading = false;
  cancellingOrderId: string | null = null;
  
  // Filtros
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  searchValue: string = '';

  // Para el estado de las órdenes
  orderStatus = OrderStatus;

  // Para el modal de tracking
  trackingModalVisible = false;
  trackingData: TrackingStatus | null = null;
  trackingResponseTime: number = 0;
  trackingLoading = false;
  trackingError: string | null = null;
  currentTrackingOrderNumber: string = '';

  constructor(
    private orderService: OrderService,
    private trackingService: TrackingService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private authService: AuthService,
    private router: Router
  ) {
    // Register Ionicons
    addIcons({
      cartOutline,
      refreshOutline,
      closeOutline,
      flashOutline,
      calendarOutline,
      searchOutline,
      cubeOutline,
      checkmarkCircle,
      timeOutline,
      closeCircle,
      chatbubbleOutline
    });
  }

  ngOnInit() {
    // Initial setup
  }

  ionViewWillEnter(): void {
    // Check if user is authenticated when view is about to enter
    if (!this.authService.isLoggedIn()) {
      this.showToast('Authentication Required: Please log in to view your orders', 'danger');
      this.router.navigate(['/profile']);
      return;
    }

    // Load orders when entering the view
    this.loadOrders();
  }

  async loadOrders() {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.filteredOrders = [...this.orders];
        this.loading = false;
      },
      error: async (error) => {
        console.error('Error loading orders:', error);
        await this.showToast('Could not load orders', 'danger');
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      
      // Filtro por fechas
      const dateFilter = (!this.dateFrom || orderDate >= this.dateFrom) &&
                        (!this.dateTo || orderDate <= this.dateTo);
      
      // Filtro por búsqueda
      const searchFilter = !this.searchValue || 
                          order.orderNumber.toLowerCase().includes(this.searchValue.toLowerCase()) ||
                          order.deliveryAddress.toLowerCase().includes(this.searchValue.toLowerCase());
      
      return dateFilter && searchFilter;
    });
  }

  clearFilters() {
    this.dateFrom = null;
    this.dateTo = null;
    this.searchValue = '';
    this.filteredOrders = [...this.orders];
  }

  async cancelOrder(order: OrderResponse) {
    const alert = await this.alertController.create({
      header: 'Cancel Order',
      message: `Are you sure you want to cancel order ${order.orderNumber}? This action cannot be undone.`,
      buttons: [
        {
          text: 'No, Keep Order',
          role: 'cancel'
        },
        {
          text: 'Yes, Cancel Order',
          role: 'destructive',
          handler: () => {
            this.cancellingOrderId = order.id;
            this.orderService.cancelOrder(order.id).subscribe({
              next: async (updatedOrder) => {
                // Actualizar la orden en la lista
                const index = this.orders.findIndex(o => o.id === order.id);
                if (index !== -1) {
                  this.orders[index] = updatedOrder;
                }
                
                // Actualizar filteredOrders también
                const filteredIndex = this.filteredOrders.findIndex(o => o.id === order.id);
                if (filteredIndex !== -1) {
                  this.filteredOrders[filteredIndex] = updatedOrder;
                }

                this.cancellingOrderId = null;
                await this.showToast(`Order ${order.orderNumber} has been cancelled successfully`, 'success');
              },
              error: async (error) => {
                this.cancellingOrderId = null;
                console.error('Error canceling order:', error);
                
                let errorMessage = 'Could not cancel the order. Please try again.';
                
                // Handle specific error cases
                if (error.status === 403) {
                  errorMessage = 'You don\'t have permission to cancel this order.';
                } else if (error.status === 400) {
                  errorMessage = 'This order cannot be cancelled in its current status.';
                } else if (error.status === 404) {
                  errorMessage = 'Order not found.';
                }
                
                await this.showToast(errorMessage, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(message: string, color: string = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  canCancelOrder(status: string): boolean {
    // Only PENDING orders can be cancelled, matching backend logic
    return status === OrderStatus.PENDING;
  }

  isCancellingOrder(orderId: string): boolean {
    return this.cancellingOrderId === orderId;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CONFIRMED:
        return 'primary';
      case OrderStatus.SHIPPED:
        return 'secondary';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CONFIRMED:
        return 'info';
      case OrderStatus.PROCESSING:
        return 'secondary';
      case OrderStatus.SHIPPED:
        return 'info';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'contrast';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.CONFIRMED:
        return 'Confirmed';
      case OrderStatus.PROCESSING:
        return 'Processing';
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  getActionMessage(status: string): string {
    switch (status) {
      case OrderStatus.SHIPPED:
        return 'Shipped';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'No actions';
    }
  }

  getActionTooltip(status: string): string {
    switch (status) {
      case OrderStatus.SHIPPED:
        return 'Order has been shipped and cannot be cancelled';
      case OrderStatus.DELIVERED:
        return 'Order has been delivered and cannot be cancelled';
      case OrderStatus.CANCELLED:
        return 'Order has already been cancelled';
      default:
        return 'No actions available for this order status';
    }
  }

  // Métodos para el modal de tracking
  openTrackingModal(orderNumber: string) {
    this.currentTrackingOrderNumber = orderNumber;
    this.trackingModalVisible = true;
    this.fetchTrackingData(orderNumber);
  }

  closeTrackingModal() {
    this.trackingModalVisible = false;
    this.trackingData = null;
    this.trackingError = null;
    this.currentTrackingOrderNumber = '';
    this.trackingResponseTime = 0;
  }

  fetchTrackingData(orderNumber: string, forceRefresh: boolean = false) {
    this.trackingLoading = true;
    this.trackingError = null;
    this.trackingData = null;

    try {
      this.trackingService.getTrackingStatus(orderNumber, forceRefresh).subscribe({
        next: (response: TrackingResponse) => {
          this.trackingData = response.data;
          this.trackingResponseTime = response.responseTime;
          this.trackingLoading = false;
          
          // Si se hizo un refresh forzado, mostrar mensaje informativo
          if (forceRefresh) {
            this.showToast('Tracking information has been updated with the latest data', 'success');
          }
        },
        error: (error) => {
          this.trackingLoading = false;
          this.trackingResponseTime = error.responseTime || 0;
          
          // Manejo específico de errores de autenticación
          if (error.status === 401) {
            this.trackingError = 'Authentication required. Please log in to view tracking information.';
            this.showToast('Please log in to view tracking information', 'warning');
          } else if (error.status === 403) {
            this.trackingError = 'Access denied. You don\'t have permission to view this order\'s tracking information.';
            this.showToast('You don\'t have permission to view this order', 'danger');
          } else if (error.status === 404) {
            this.trackingError = error.error?.message || 'No tracking information found for this order';
          } else if (error.status === 500) {
            this.trackingError = error.error?.message || 'Internal server error occurred';
          } else {
            this.trackingError = 'Failed to fetch tracking information';
          }

          console.error('Error fetching tracking data:', error);
        }
      });
    } catch (authError: any) {
      // Manejo de errores de token (cuando no hay token disponible)
      this.trackingLoading = false;
      this.trackingError = authError.message || 'Authentication token not available. Please log in.';
      this.showToast('Please log in to view tracking information', 'warning');
      console.error('Authentication error:', authError);
    }
  }

  reloadTrackingData() {
    if (this.currentTrackingOrderNumber) {
      this.fetchTrackingData(this.currentTrackingOrderNumber, true); // Forzar refresh
    }
  }

  getTrackingStatusSeverity(status: OrderStatusEnum): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    switch (status) {
      case OrderStatusEnum.PENDING:
        return 'warning';
      case OrderStatusEnum.SHIPPED:
        return 'info';
      case OrderStatusEnum.DELIVERED:
        return 'success';
      case OrderStatusEnum.CANCELLED:
        return 'danger';
      default:
        return 'contrast';
    }
  }

  getTrackingStatusLabel(status: OrderStatusEnum): string {
    switch (status) {
      case OrderStatusEnum.PENDING:
        return 'Pending';
      case OrderStatusEnum.SHIPPED:
        return 'Shipped';
      case OrderStatusEnum.DELIVERED:
        return 'Delivered';
      case OrderStatusEnum.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  openChatWithPersonalShopper(order: OrderResponse) {
    if (order.personalShopperId) {
      // Navigate to chat with personal shopper
      this.router.navigate(['/chat', order.id]);
    } else {
      this.showToast('No personal shopper assigned to this order yet', 'warning');
    }
  }

  hasPersonalShopper(order: OrderResponse): boolean {
    return !!order.personalShopperId;
  }
}
