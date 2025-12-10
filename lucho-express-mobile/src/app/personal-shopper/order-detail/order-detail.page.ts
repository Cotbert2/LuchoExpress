import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
  IonSpinner,
  IonAlert,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  callOutline,
  mailOutline,
  locationOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  chatbubbleOutline,
  cashOutline,
  cartOutline
} from 'ionicons/icons';
import { PersonalShopperService } from '../../services/personal-shopper.service';
import { Order, OrderStatus } from '../../interfaces/personal-shopper.interface';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonIcon,
    IonSpinner,
    IonAlert
  ]
})
export class OrderDetailPage implements OnInit {
  order: Order | null = null;
  loading = true;
  error: string | null = null;
  updating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private psService: PersonalShopperService,
    private alertController: AlertController
  ) {
    addIcons({
      arrowBackOutline,
      personOutline,
      callOutline,
      mailOutline,
      locationOutline,
      checkmarkCircleOutline,
      arrowForwardOutline,
      chatbubbleOutline,
      cashOutline,
      cartOutline
    });
  }

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(orderId);
    }
  }

  loadOrderDetail(orderId: string) {
    this.loading = true;
    this.error = null;

    this.psService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = 'No se pudo cargar la orden';
        this.loading = false;
      }
    });
  }

  async confirmStatusChange(newStatus: OrderStatus) {
    const alert = await this.alertController.create({
      header: 'Confirmar cambio de estado',
      message: `¿Estás seguro de cambiar el estado a ${this.getStatusLabel(newStatus)}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.updateOrderStatus(newStatus);
          }
        }
      ]
    });

    await alert.present();
  }

  updateOrderStatus(newStatus: OrderStatus) {
    if (!this.order) return;

    this.updating = true;
    this.psService.updateOrderStatus(this.order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.updating = false;
        this.showSuccessAlert();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.updating = false;
        this.showErrorAlert(err.error?.message || 'No se pudo actualizar el estado');
      }
    });
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Estado actualizado correctamente',
      buttons: ['OK']
    });
    await alert.present();
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  getNextStatus(): OrderStatus | null {
    if (!this.order) return null;

    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
      [OrderStatus.CONFIRMED]: OrderStatus.SHIPPED,
      [OrderStatus.SHIPPED]: OrderStatus.DELIVERED,
      [OrderStatus.DELIVERED]: null,
      [OrderStatus.CANCELLED]: null
    };

    return statusFlow[this.order.status];
  }

  getNextStatusLabel(): string {
    const nextStatus = this.getNextStatus();
    return nextStatus ? this.getStatusLabel(nextStatus) : '';
  }

  canUpdateStatus(): boolean {
    return this.order !== null && 
           this.getNextStatus() !== null && 
           !this.updating;
  }

  openChat() {
    if (this.order) {
      this.router.navigate(['/personal-shopper/chat', this.order.id]);
    }
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
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
