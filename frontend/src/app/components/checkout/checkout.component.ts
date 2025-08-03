import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';

import { ConfirmationService, MessageService } from 'primeng/api';
import { DataViewModule } from 'primeng/dataview';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    DataViewModule,
    RadioButtonModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    DividerModule,
    TagModule,
    ToolbarModule,
    FormsModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = { items: [], totalItems: 0, totalAmount: 0 };
  isLoading: boolean = false;
  showCheckoutStepper: boolean = false;
  activeStepIndex: number = 0;
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Authentication Required',
        detail: 'Please log in to access your cart',
        life: 4000
      });
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.loadCart();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /**
   * Load cart data
   */
  private loadCart(): void {
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartSummary = this.cartService.getCartSummary();
      console.log('Cart updated:', this.cartSummary);
    });
  }

  /**
   * Update item quantity
   */
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.confirmRemoveItem(item);
      return;
    }

    this.cartService.updateItemQuantity(item.id, newQuantity);
    this.messageService.add({
      severity: 'success',
      summary: 'Quantity Updated',
      detail: `${item.name} quantity updated to ${newQuantity}`,
      life: 2000
    });
  }

  /**
   * Remove item from cart with confirmation
   */
  confirmRemoveItem(item: CartItem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove "${item.name}" from your cart?`,
      header: 'Remove Item',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-sm',
      accept: () => {
        this.cartService.removeFromCart(item.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Item Removed',
          detail: `${item.name} has been removed from your cart`,
          life: 3000
        });
      },
      reject: () => {
        // User cancelled, no action needed
      }
    });
  }

  /**
   * Clear entire cart with confirmation
   */
  confirmClearCart(): void {
    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Cart Empty',
        detail: 'Your cart is already empty',
        life: 2000
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to remove all items from your cart?',
      header: 'Clear Cart',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.cartService.clearCart();
        this.messageService.add({
          severity: 'success',
          summary: 'Cart Cleared',
          detail: 'All items have been removed from your cart',
          life: 3000
        });
      }
    });
  }

  /**
   * Proceed to checkout process
   */
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Empty Cart',
        detail: 'Please add some items to your cart before proceeding',
        life: 3000
      });
      return;
    }

    // Show the checkout stepper
    this.showCheckoutStepper = true;
    this.activeStepIndex = 0;
  }

  /**
   * Go back to cart view
   */
  backToCart(): void {
    this.showCheckoutStepper = false;
    this.activeStepIndex = 0;
  }

  /**
   * Move to next step in checkout process
   */
  nextStep(): void {
    if (this.activeStepIndex < 2) {
      this.activeStepIndex++;
    }
  }

  /**
   * Move to previous step in checkout process
   */
  previousStep(): void {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
    }
  }

  /**
   * Complete checkout process
   */
  completeCheckout(): void {
    this.isLoading = true;
    
    // Simulate checkout process
    setTimeout(() => {
      this.isLoading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Order Placed',
        detail: 'Your order has been placed successfully!',
        life: 5000
      });
      
      // Clear cart after successful order
      this.cartService.clearCart();
      
      // Reset stepper state
      this.showCheckoutStepper = false;
      this.activeStepIndex = 0;
      
      // Redirect to home or order confirmation page
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
      
    }, 2000);
  }

  /**
   * Continue shopping
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Go back to home
   */
  goHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Get item total price
   */
  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }
}
