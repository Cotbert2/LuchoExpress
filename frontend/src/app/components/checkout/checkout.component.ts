import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CustomerService, CreateCustomerRequest, CustomerResponse } from '../../services/customer.service';
import { UserResponse } from '../../interfaces/auth.interface';
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
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';

import { ConfirmationService, MessageService } from 'primeng/api';
import { DataViewModule } from 'primeng/dataview';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    InputTextModule,
    FloatLabelModule,
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
  
  // User and Customer data
  currentUser: UserResponse | null = null;
  existingCustomer: CustomerResponse | null = null;
  
  // Forms
  personalInfoForm!: FormGroup;
  shippingInfoForm!: FormGroup;
  
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.initializeForms();
  }

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

    this.loadUserAndCart();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /**
   * Initialize reactive forms
   */
  private initializeForms(): void {
    this.personalInfoForm = this.formBuilder.group({
      documentId: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(20)]]
    });

    this.shippingInfoForm = this.formBuilder.group({
      address: ['', [Validators.required, Validators.maxLength(255)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.required, Validators.maxLength(100)]],
      zipCode: ['', [Validators.required, Validators.maxLength(20)]],
      country: ['', [Validators.required, Validators.maxLength(100)]],
      deliveryInstructions: ['', [Validators.maxLength(500)]]
    });
  }

  /**
   * Load user data and cart
   */
  private loadUserAndCart(): void {
    // Get current user first
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.checkExistingCustomer(user.id);
      } else {
        // If no user in observable, fetch from server
        this.authService.getCurrentUser().subscribe({
          next: (fetchedUser) => {
            this.currentUser = fetchedUser;
            this.checkExistingCustomer(fetchedUser.id);
          },
          error: (error) => {
            console.error('Error fetching user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'User Error',
              detail: 'Could not load user information',
              life: 3000
            });
          }
        });
      }
    });

    this.loadCart();
  }

  /**
   * Check if user already has a customer profile
   */
  private checkExistingCustomer(userId: string): void {
    this.customerService.getCustomerByUserId(userId).subscribe({
      next: (customer) => {
        this.existingCustomer = customer;
        this.preloadCustomerData(customer);
      },
      error: (error) => {
        // Customer doesn't exist yet, which is fine
        console.log('No existing customer found for user:', userId);
        this.existingCustomer = null;
      }
    });
  }

  /**
   * Preload customer data into forms
   */
  private preloadCustomerData(customer: CustomerResponse): void {
    // Preload personal information
    this.personalInfoForm.patchValue({
      documentId: customer.documentId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || ''
    });

    // If customer has address, try to parse it for shipping form
    if (customer.address) {
      this.parseAndLoadAddress(customer.address);
    }
  }

  /**
   * Parse address string and load into shipping form
   * This is a simple implementation - you might want to enhance it based on your address format
   */
  private parseAndLoadAddress(address: string): void {
    // Simple parsing - you might want to enhance this based on your address format
    const parts = address.split(', ');
    if (parts.length >= 4) {
      this.shippingInfoForm.patchValue({
        address: parts[0] || '',
        city: parts[1] || '',
        state: parts[2] || '',
        zipCode: parts[3] || '',
        country: parts[4] || ''
      });
    }
  }
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

    // Show message if customer data was preloaded
    if (this.existingCustomer) {
      this.messageService.add({
        severity: 'info',
        summary: 'Customer Information Loaded',
        detail: 'Your saved customer information has been preloaded. You can modify it if needed.',
        life: 5000
      });
    }
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
    if (this.activeStepIndex === 0) {
      // Validate personal info form before proceeding
      if (this.personalInfoForm.valid) {
        // Create or update customer when moving from step 0 to step 1
        this.createOrUpdateCustomer();
      } else {
        this.markFormGroupTouched(this.personalInfoForm);
        this.messageService.add({
          severity: 'warn',
          summary: 'Form Invalid',
          detail: 'Please fill in all required fields correctly',
          life: 3000
        });
      }
    } else if (this.activeStepIndex === 1) {
      // Validate shipping info form before proceeding
      if (this.shippingInfoForm.valid) {
        this.activeStepIndex++;
      } else {
        this.markFormGroupTouched(this.shippingInfoForm);
        this.messageService.add({
          severity: 'warn',
          summary: 'Form Invalid',
          detail: 'Please fill in all required shipping information',
          life: 3000
        });
      }
    } else if (this.activeStepIndex < 2) {
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
   * Create or update customer when moving from personal info step
   */
  private createOrUpdateCustomer(): void {
    if (!this.currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'User Error',
        detail: 'User information is not available',
        life: 3000
      });
      return;
    }

    this.isLoading = true;

    if (this.existingCustomer) {
      // Update existing customer
      this.updateCustomerData();
    } else {
      // Create new customer
      this.createNewCustomer();
    }
  }

  /**
   * Create new customer
   */
  private createNewCustomer(): void {
    if (!this.currentUser) return;

    const customerData: CreateCustomerRequest = {
      userId: this.currentUser.id,
      documentId: this.personalInfoForm.get('documentId')?.value,
      name: this.personalInfoForm.get('name')?.value,
      email: this.personalInfoForm.get('email')?.value,
      phone: this.personalInfoForm.get('phone')?.value,
      address: '' // Address will be updated in step 2
    };

    this.customerService.createCustomer(customerData).subscribe({
      next: (customer) => {
        this.isLoading = false;
        this.existingCustomer = customer;
        this.activeStepIndex++;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Customer Created',
          detail: 'Your customer information has been saved successfully.',
          life: 3000
        });
        
        console.log('Customer created successfully:', customer);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating customer:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Customer Creation Failed',
          detail: error.message || 'There was an error saving your customer information. Please try again.',
          life: 5000
        });
      }
    });
  }

  /**
   * Update existing customer data
   */
  private updateCustomerData(): void {
    if (!this.existingCustomer) return;

    const updateData = {
      name: this.personalInfoForm.get('name')?.value,
      email: this.personalInfoForm.get('email')?.value,
      phone: this.personalInfoForm.get('phone')?.value,
      // Keep existing address if available, will be updated in step 2
      address: this.existingCustomer.address || ''
    };

    this.customerService.updateCustomer(this.existingCustomer.id, updateData).subscribe({
      next: (customer) => {
        this.isLoading = false;
        this.existingCustomer = customer;
        this.activeStepIndex++;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Customer Updated',
          detail: 'Your customer information has been updated successfully.',
          life: 3000
        });
        
        console.log('Customer updated successfully:', customer);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating customer:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Customer Update Failed',
          detail: error.message || 'There was an error updating your customer information. Please try again.',
          life: 5000
        });
      }
    });
  }

  /**
   * Mark all fields in a form group as touched to trigger validation messages
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} is too long`;
      }
    }
    return '';
  }

  /**
   * Get display name for form fields
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      documentId: 'Document ID',
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country',
      deliveryInstructions: 'Delivery Instructions'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Check if a field has an error and should show error styling
   */
  hasFieldError(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Complete checkout process
   */
  completeCheckout(): void {
    if (!this.personalInfoForm.valid || !this.shippingInfoForm.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Forms Invalid',
        detail: 'Please complete all required information',
        life: 3000
      });
      return;
    }

    if (!this.currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'User Error',
        detail: 'User information is not available',
        life: 3000
      });
      return;
    }

    if (!this.existingCustomer) {
      this.messageService.add({
        severity: 'error',
        summary: 'Customer Error',
        detail: 'Customer information is not available',
        life: 3000
      });
      return;
    }

    this.isLoading = true;
    
    // Update customer address with shipping information before completing order
    this.updateCustomerAddressAndCompleteOrder();
  }

  /**
   * Update customer address with shipping information and complete order
   */
  private updateCustomerAddressAndCompleteOrder(): void {
    if (!this.existingCustomer) return;

    const updateData = {
      name: this.personalInfoForm.get('name')?.value,
      email: this.personalInfoForm.get('email')?.value,
      phone: this.personalInfoForm.get('phone')?.value,
      address: this.buildFullAddress()
    };

    this.customerService.updateCustomer(this.existingCustomer.id, updateData).subscribe({
      next: (customer) => {
        console.log('Customer address updated successfully:', customer);
        this.existingCustomer = customer;
        this.completeOrderProcess(customer);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating customer address:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Order Failed',
          detail: error.message || 'There was an error processing your order. Please try again.',
          life: 5000
        });
      }
    });
  }

  /**
   * Complete the order process after customer is created/updated
   */
  private completeOrderProcess(customer: CustomerResponse): void {
    // Simulate order processing
    setTimeout(() => {
      this.isLoading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Order Placed Successfully!',
        detail: `Thank you ${customer.name}! Your order has been placed and will be shipped to your address.`,
        life: 5000
      });
      
      // Clear cart after successful order
      this.cartService.clearCart();
      
      // Reset stepper state and forms
      this.resetCheckoutState();
      
      // Redirect to home or order confirmation page
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
    }, 2000);
  }

  /**
   * Build full address from shipping form
   */
  private buildFullAddress(): string {
    const addressParts = [
      this.shippingInfoForm.get('address')?.value,
      this.shippingInfoForm.get('city')?.value,
      this.shippingInfoForm.get('state')?.value,
      this.shippingInfoForm.get('zipCode')?.value,
      this.shippingInfoForm.get('country')?.value
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.join(', ');
  }

  /**
   * Reset checkout state and forms
   */
  private resetCheckoutState(): void {
    this.showCheckoutStepper = false;
    this.activeStepIndex = 0;
    this.personalInfoForm.reset();
    this.shippingInfoForm.reset();
    // Note: We don't clear existingCustomer here as it should persist for the session
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
