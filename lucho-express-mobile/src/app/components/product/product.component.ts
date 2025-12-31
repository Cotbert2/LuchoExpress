import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {  
  ToastController,
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
        IonModal,
        IonBadge
 } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cartOutline, 
  addOutline, 
  removeOutline, 
  starOutline, 
  star,
  arrowBackOutline 
} from 'ionicons/icons';
import { CartService } from '../../services/cart.service';
import { ProductsService } from '../../services/products.service';


@Component({
  selector: 'app-product',
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
          IonBadge,
          IonTextarea,
          IonText,
          IonModal
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  @Input() product: any = {};
  @Output() addToCartEvent = new EventEmitter<any>();

  tableData: any = [];
  productDescription: any = {};
  cuantity: number = 1;
  rating: number = 3;
  stock: number = 10;
  isLoading: boolean = true;

  constructor(
    private cartService: CartService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService
  ) {
    // Register Ionicons
    addIcons({
      cartOutline,
      addOutline,
      removeOutline,
      starOutline,
      star,
      arrowBackOutline
    });
  }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (productId) {
      this.loadProduct(productId);
    } else if (this.product && this.product.id) {
      // Si se pasó el producto como Input
      this.initializeProductData();
    } else {
      this.showToast('Product not found', 'danger');
      this.router.navigate(['/home']);
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.productsService.getProductById(id).subscribe({
      next: (data: any) => {
        this.product = data;
        this.initializeProductData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.showToast('Error loading product', 'danger');
        this.isLoading = false;
        this.router.navigate(['/home']);
      }
    });
  }

  initializeProductData(): void {
    this.rating = this.generateRandomNumber(3, 5);
    this.stock = this.generateRandomNumber(1, 50);
    console.log('product: ', this.product);
    
    // Handle product description parsing safely
    try {
      if (this.product.description && typeof this.product.description === 'string') {
        this.productDescription = JSON.parse(this.product.description);
        this.tableData = Object.entries(this.productDescription).map(([key, value]) => ({ key, value }));
      } else {
        this.productDescription = { description: this.product.description || 'No description available' };
        this.tableData = [{ key: 'Description', value: this.product.description || 'No description available' }];
      }
    } catch (error) {
      console.warn('Error parsing product description:', error);
      this.productDescription = { description: this.product.description || 'No description available' };
      this.tableData = [{ key: 'Description', value: this.product.description || 'No description available' }];
    }
  }

  /**
   * Add product to cart
   */
  async addToCart(): Promise<void> {
    if (!this.product || !this.product.id) {
      await this.showToast('Invalid product data', 'danger');
      return;
    }

    if (this.cuantity <= 0 || this.cuantity > this.stock) {
      await this.showToast(`Please select a quantity between 1 and ${this.stock}`, 'warning');
      return;
    }

    // Add to cart service
    this.cartService.addToCart(this.product, this.cuantity);

    // Show success message
    await this.showToast(`${this.cuantity} x ${this.product.name} added successfully`, 'success');

    // Emit event for parent component (backward compatibility)
    const itemToCart = {
      product: this.product,
      cuantity: this.cuantity
    };
    this.addToCartEvent.emit(itemToCart);

    // Reset quantity to 1 after adding
    this.cuantity = 1;
    
    console.log('Added to cart:', { product: this.product, quantity: this.cuantity });
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

  decreaseQuantity(): void {
    if (this.cuantity > 1) {
      this.cuantity--;
    }
  }

  increaseQuantity(): void {
    if (this.cuantity < this.stock) {
      this.cuantity++;
    }
  }


  /**
   * Generate random number between min and max
   */
  generateRandomNumber(min: number = 1, max: number = 5): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
