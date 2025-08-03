import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule, 
    InputNumberModule, 
    ButtonModule, 
    ImageModule,
    PanelModule,
    TableModule,
    RatingModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
  providers: [MessageService]
})
export class ProductComponent implements OnInit {
  @Input() product: any;
  @Output() addToCartEvent = new EventEmitter<any>();

  tableData: any = [];
  productDescription: any = {};
  cuantity: number = 1;
  rating: number = 3;
  stock: number = 10;

  constructor(
    private cartService: CartService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
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
  addToCart(): void {
    if (!this.product || !this.product.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid product data',
        life: 3000
      });
      return;
    }

    if (this.cuantity <= 0 || this.cuantity > this.stock) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Quantity',
        detail: `Please select a quantity between 1 and ${this.stock}`,
        life: 3000
      });
      return;
    }

    // Add to cart service
    this.cartService.addToCart(this.product, this.cuantity);

    // Show success message
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${this.cuantity} x ${this.product.name} added successfully`,
      life: 3000
    });

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


  /**
   * Generate random number between min and max
   */
  generateRandomNumber(min: number = 1, max: number = 5): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
