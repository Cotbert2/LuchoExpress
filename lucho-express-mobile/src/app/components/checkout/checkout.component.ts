import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CustomerService, CreateCustomerRequest, CustomerResponse } from '../../services/customer.service';
import { OrderService, CreateOrderRequest, CreateOrderProductRequest, OrderResponse } from '../../services/order.service';
import { UserResponse } from '../../interfaces/auth.interface';
import { Subscription } from 'rxjs';

// Ionic imports
import {  
  ToastController,
  AlertController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonChip,
  IonLabel,
  IonContent,
  IonList,
  IonItem,
  IonItemDivider,
  IonInput,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle, ViewWillEnter,
  IonSegment, IonNote,
  IonSpinner,
  IonTextarea

} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cartOutline, 
  trashOutline, 
  arrowBackOutline, 
  checkmarkCircleOutline, 
  alertCircleOutline,
  cardOutline,
  locationOutline,
  personOutline,
  callOutline,
  mailOutline,
  homeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  IonTextarea
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  standalone: true
})
export class CheckoutComponent implements OnInit, OnDestroy, ViewWillEnter {
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
    private toastController: ToastController,
    private alertController: AlertController,
    private customerService: CustomerService,
    private orderService: OrderService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    addIcons({
      cartOutline,
      trashOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      cardOutline,
      locationOutline,
      personOutline,
      callOutline,
      mailOutline,
      homeOutline
    });
    this.initializeForms();
  }

  ngOnInit(): void {
    // Initial setup
  }

  ionViewWillEnter(): void {
    // Check if user is authenticated when view is about to enter
    if (!this.authService.isLoggedIn()) {
      this.showToast('Authentication Required: Please log in to access your cart', 'success');
      this.router.navigate(['/profile']);
      return;
    }
    
    // Reload cart data every time the view is entered
    this.loadCart();
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
      documentId: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\-]+$/) // Alphanumeric and hyphens only
      ]],
      name: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/) // Letters, spaces, and accented characters only
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      phone: ['', [
        Validators.minLength(10),
        Validators.maxLength(20),
        Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/) // Numbers, spaces, hyphens, parentheses, and optional +
      ]]
    });

    this.shippingInfoForm = this.formBuilder.group({
      address: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(255)
      ]],
      city: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/) // Letters, spaces, and accented characters only
      ]],
      state: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/) // Letters, spaces, and accented characters only
      ]],
      zipCode: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9\-\s]+$/) // Alphanumeric, hyphens, and spaces
      ]],
      country: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/) // Letters, spaces, and accented characters only
      ]],
      deliveryInstructions: ['', [
        Validators.maxLength(500)
      ]]
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
            this.showToast('Could not load user information', 'danger');

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
    // Unsubscribe from previous subscription if exists
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    
    // Get current cart state immediately
    this.cartItems = this.cartService.getCartItems();
    this.cartSummary = this.cartService.getCartSummary();
    console.log('Cart loaded:', this.cartSummary);
    
    // Subscribe to future changes
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartSummary = this.cartService.getCartSummary();
      console.log('Cart updated:', this.cartSummary);
    });
  }

  /**
   * Update item quantity with validation
   */
  updateQuantity(item: CartItem, newQuantity: number): void {
    // Validate new quantity
    if (newQuantity <= 0) {
      this.showToast('Invalid Quantity: Quantity must be at least 1. Item will be removed if you want quantity 0.', 'warning');
      this.confirmRemoveItem(item);
      return;
    }

    // Check for reasonable maximum quantity (optional business rule)
    const maxQuantity = 99;
    if (newQuantity > maxQuantity) {
      this.showToast(`Quantity Too High: Maximum quantity per item is ${maxQuantity}. Please contact us for bulk orders.`, 'warning');
      return;
    }

    // Validate that quantity is a whole number
    if (newQuantity !== Math.floor(newQuantity)) {
      this.showToast('Invalid Quantity: Quantity must be a whole number', 'warning');
      return;
    }

    try {
      this.cartService.updateItemQuantity(item.id, newQuantity);
      this.showToast(`Quantity Updated: ${item.name} quantity updated to ${newQuantity}`, 'success');
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showToast('Update Failed: Failed to update item quantity. Please try again.', 'danger' );
    }
  }

  /**
   * Remove item from cart with confirmation
   */
  async confirmRemoveItem(item: CartItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Remove Item',
      message: `Are you sure you want to remove "${item.name}" from your cart?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.cartService.removeFromCart(item.id);
            this.showToast(`Item Removed: ${item.name} has been removed from your cart`);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Clear entire cart with confirmation
   */
  async confirmClearCart(): Promise<void> {
    if (this.cartItems.length === 0) {
      this.showToast('Cart Empty: Your cart is already empty', 'warning')
      return;
    }

    const alert = await this.alertController.create({
      header: 'Clear Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear All',
          role: 'destructive',
          handler: () => {
            this.cartService.clearCart();
            this.showToast('Cart Cleared: All items have been removed from your cart');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Proceed to checkout process
   */
  proceedToCheckout(): void {
    const cartValidation = this.validateCartItems();
    
    if (!cartValidation.isValid) {
      this.showToast(`Cart issues Found ${cartValidation.message}`);
      return;
    }

    // Show the checkout stepper
    this.showCheckoutStepper = true;
    this.activeStepIndex = 0;

    // Show message if customer data was preloaded
    if (this.existingCustomer) {
      this.showToast('Customer Information Loaded: Your saved customer information has been preloaded. You can modify it if needed.');
    }
  }

  /**
   * Validate cart items before checkout
   */
  private validateCartItems(): { isValid: boolean; message: string } {
    if (this.cartItems.length === 0) {
      return {
        isValid: false,
        message: 'Your cart is empty. Please add some items before proceeding.'
      };
    }

    const invalidItems: string[] = [];
    const zeroQuantityItems: string[] = [];
    let totalValue = 0;

    for (const item of this.cartItems) {
      // Check for zero or negative quantities
      if (item.quantity <= 0) {
        zeroQuantityItems.push(item.name);
      }

      // Check for invalid prices
      if (item.price <= 0) {
        invalidItems.push(`${item.name} (invalid price)`);
      }

      // Check for missing product information
      if (!item.name || item.name.trim() === '') {
        invalidItems.push('Product with missing name');
      }

      totalValue += item.price * item.quantity;
    }

    // Check for zero quantity items
    if (zeroQuantityItems.length > 0) {
      return {
        isValid: false,
        message: `The following items have invalid quantities: ${zeroQuantityItems.join(', ')}. Please update the quantities.`
      };
    }

    // Check for invalid items
    if (invalidItems.length > 0) {
      return {
        isValid: false,
        message: `The following items have issues: ${invalidItems.join(', ')}. Please remove them from your cart.`
      };
    }

    const minimumOrderValue = 9.99; 
    
    if (totalValue < minimumOrderValue) {
      return {
        isValid: false,
        message: `Minimum order value is ${this.formatCurrency(minimumOrderValue)}. Current total: ${this.formatCurrency(totalValue)}.`
      };
    }

    return {
      isValid: true,
      message: 'Cart is valid'
    };
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
        this.showValidationErrorsForStep('personal information');
      }
    } else if (this.activeStepIndex === 1) {
      // Validate shipping info form before proceeding
      if (this.shippingInfoForm.valid) {
        // Update customer address when moving from step 1 to step 2
        this.updateCustomerAddress();
      } else {
        this.markFormGroupTouched(this.shippingInfoForm);
        this.showValidationErrorsForStep('shipping information');
      }
    } else if (this.activeStepIndex < 2) {
      this.activeStepIndex++;
    }
  }

  /**
   * Show specific validation errors for the current step
   */
  private showValidationErrorsForStep(stepName: string): void {
    const form = this.activeStepIndex === 0 ? this.personalInfoForm : this.shippingInfoForm;
    const invalidFields: string[] = [];
    
    Object.keys(form.controls).forEach(fieldName => {
      const control = form.get(fieldName);
      if (control?.errors && control.touched) {
        invalidFields.push(this.getFieldDisplayName(fieldName));
      }
    });

    if (invalidFields.length > 0) {
      const fieldsList = invalidFields.join(', ');
      this.showToast(`Incomplete ${stepName}: Please fix the following fields: ${fieldsList}`)
    } else {
      this.showToast(`Form Invalid: Please complete all required ${stepName} fields`)
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
      this.showToast('User Error: User information is not availables', 'danger')
  
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

        this.showToast('Customer Created: Your customer information has been saved successfully.');

        
        console.log('Customer created successfully:', customer);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating customer:', error);
        this.showToast(`Curstomer Creation Failed: There was an error saving your customer information. Please try again`);
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
        

        this.showToast('Customer Updated:Your customer information has been updated successfully.')
        
        console.log('Customer updated successfully:', customer);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating customer:', error);
        this.showToast('Customer Update Failed: There was an error updating your customer information. Please try again.', 'danger')
      }
    });
  }

  /**
   * Update customer address when moving from shipping step
   */
  private updateCustomerAddress(): void {
    if (!this.existingCustomer) {
      this.showToast('Customer Error: Customer information is not available. Please go back to the personal information step.', 'danger');
      return;
    }

    this.isLoading = true;

    const updateData = {
      name: this.existingCustomer.name,
      email: this.existingCustomer.email,
      phone: this.existingCustomer.phone,
      address: this.buildFullAddress()
    };

    this.customerService.updateCustomer(this.existingCustomer.id, updateData).subscribe({
      next: (customer) => {
        this.isLoading = false;
        this.existingCustomer = customer;
        this.activeStepIndex++;

        this.showToast('Address Updated: Your shipping address has been saved successfully.');
        console.log('Customer address updated successfully:', customer);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating customer address:', error);
        this.showToast('Address Update Failes: There was an error saving your shipping address. Please try again.');
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
      const displayName = this.getFieldDisplayName(fieldName);
      
      if (field.errors['required']) {
        return `${displayName} is required`;
      }
      
      if (field.errors['email']) {
        return 'Please enter a valid email address (example: user@example.com)';
      }
      
      if (field.errors['pattern']) {
        return this.getPatternErrorMessage(fieldName);
      }
      
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        const actualLength = field.errors['minlength'].actualLength;
        return `${displayName} must be at least ${requiredLength} characters long (currently ${actualLength} characters)`;
      }
      
      if (field.errors['maxlength']) {
        const requiredLength = field.errors['maxlength'].requiredLength;
        const actualLength = field.errors['maxlength'].actualLength;
        return `${displayName} cannot exceed ${requiredLength} characters (currently ${actualLength} characters)`;
      }
    }
    return '';
  }

  /**
   * Get specific pattern error messages for each field
   */
  private getPatternErrorMessage(fieldName: string): string {
    const patternMessages: { [key: string]: string } = {
      documentId: 'Document ID can only contain letters, numbers, and hyphens',
      name: 'Full name can only contain letters and spaces',
      email: 'Please enter a valid email format (example: user@example.com)',
      phone: 'Phone number can only contain numbers, spaces, hyphens, parentheses, and optional country code (+)',
      city: 'City name can only contain letters and spaces',
      state: 'State name can only contain letters and spaces',
      country: 'Country name can only contain letters and spaces',
      zipCode: 'ZIP code can only contain letters, numbers, hyphens, and spaces'
    };
    
    return patternMessages[fieldName] || 'Invalid format';
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
    // Validate all forms
    const allFormsValid = this.validateAllForms();
    
    if (!allFormsValid) {
      return;
    }

    if (!this.currentUser) {
      this.showToast('Authentication Error: Your session has expired. Please log in again.', 'danger')
      this.router.navigate(['/login']);
      return;
    }

    if (!this.existingCustomer) {
      this.showToast('Customer Profile Error: Customer profile could not be created. Please try again.', 'danger')
      return;
    }

    if (this.cartItems.length === 0) {
      this.showToast('Empty Cart: Your cart is empty. Please add items before proceeding to checkout.', 'warning');
      return;
    }

    this.isLoading = true;
    
    // Complete the order process directly since customer and address are already updated
    this.completeOrderProcess(this.existingCustomer);
  }

  /**
   * Validate all forms and show detailed errors
   */
  private validateAllForms(): boolean {
    const personalValid = this.personalInfoForm.valid;
    const shippingValid = this.shippingInfoForm.valid;
    
    if (!personalValid || !shippingValid) {
      this.markFormGroupTouched(this.personalInfoForm);
      this.markFormGroupTouched(this.shippingInfoForm);
      
      const invalidSections: string[] = [];
      const invalidFields: string[] = [];
      
      if (!personalValid) {
        invalidSections.push('Personal Information');
        Object.keys(this.personalInfoForm.controls).forEach(fieldName => {
          const control = this.personalInfoForm.get(fieldName);
          if (control?.errors) {
            invalidFields.push(this.getFieldDisplayName(fieldName));
          }
        });
      }
      
      if (!shippingValid) {
        invalidSections.push('Shipping Information');
        Object.keys(this.shippingInfoForm.controls).forEach(fieldName => {
          const control = this.shippingInfoForm.get(fieldName);
          if (control?.errors) {
            invalidFields.push(this.getFieldDisplayName(fieldName));
          }
        });
      }
      
      const sectionsList = invalidSections.join(' and ');
      const fieldsList = invalidFields.join(', ');

      this.showToast(`${sectionsList} Incomplete: Please fix the following fields: ${fieldsList}`, 'warning');

      
      return false;
    }
    
    return true;
  }

  /**
   * Complete the order process after customer is created/updated
   */
  private completeOrderProcess(customer: CustomerResponse): void {
    if (this.cartItems.length === 0) {
      this.showToast('Empty Car: Cannot create order with empty cart')
      this.isLoading = false;
      return;
    }

    // Prepare order data
    const orderProducts: CreateOrderProductRequest[] = this.cartItems.map(item => ({
      productId: item.id.toString(),
      quantity: item.quantity
    }));

    const orderData: CreateOrderRequest = {
      customerId: customer.id.toString(),
      products: orderProducts,
      deliveryAddress: this.buildFullAddress(),
      estimatedDeliveryDate: this.calculateEstimatedDeliveryDate()
    };

    console.log('Creating order with data:', orderData);

    // Create the order
    this.orderService.createOrder(orderData).subscribe({
      next: (order: OrderResponse) => {
        this.isLoading = false;
        console.log('Order created successfully:', order);

        this.showToast(`Order Placed Successfully!: Thank you ${customer.name}! Your order #${order.orderNumber} has been placed and will be shipped to your address.`)

        // Clear cart after successful order
        this.cartService.clearCart();
        // Reset stepper state and forms
        this.resetCheckoutState();
        // Show order confirmation details
        this.showOrderConfirmation(order);
        // Redirect to home after showing confirmation
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 5000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating order:', error);
        
        let errorMessage = 'There was an error creating your order. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.status === 404) {
          errorMessage = 'One or more products in your cart are no longer available.';
        } else if (error.status === 400) {
          errorMessage = 'Invalid order data. Please check your information.';
        }
        this.showToast('Order Creation Failed: ' + errorMessage, 'danger');
      }
    });
  }

  /**
   * Calculate estimated delivery date (e.g., 5-7 business days from now)
   */
  private calculateEstimatedDeliveryDate(): string {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 7); // 7 days from now
    return deliveryDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  /**
   * Show order confirmation details
   */
  private showOrderConfirmation(order: OrderResponse): void {
    this.showToast(`Order Number: ${order.orderNumber}\nTotal Amount: ${this.formatCurrency(order.totalAmount)}\nEstimated Delivery: ${order.estimatedDeliveryDate || 'TBD'}`, 'primary');

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
   * Format currency with fallback for container environments
   */
  formatCurrency(amount: number): string {
    // Ensure we have a proper number and use consistent formatting
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
      return '$0.00';
    }
    
    try {
      // Use a more explicit approach to avoid locale issues in containers
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericAmount);
    } catch (error) {
      // Fallback for environments where Intl might not work properly
      console.warn('Intl.NumberFormat failed, using fallback:', error);
      return `$${numericAmount.toFixed(2)}`;
    }
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }


  private async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

}
