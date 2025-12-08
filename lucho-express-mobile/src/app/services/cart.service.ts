import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'lucho_express_cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Load cart items from localStorage
   */
  private loadCartFromStorage(): void {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        const items = JSON.parse(cartData) as CartItem[];
        this.cartItemsSubject.next(items);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.clearCart();
    }
  }

  /**
   * Save cart items to localStorage
   */
  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Add item to cart or update quantity if item already exists
   */
  addToCart(product: any, quantity: number = 1): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItemIndex = currentItems.findIndex(item => item.id === product.id);

    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      this.updateCart(updatedItems);
    } else {
      // New item, add to cart
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl,
        description: product.description,
        categoryId: product.categoryId
      };
      
      const updatedItems = [...currentItems, newItem];
      this.updateCart(updatedItems);
    }

    console.log(`Added ${quantity} of ${product.name} to cart`);
  }

  /**
   * Update cart items
   */
  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: string): void {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.filter(item => item.id !== productId);
    this.updateCart(updatedItems);
    console.log(`Removed item ${productId} from cart`);
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(productId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    this.updateCart(updatedItems);
  }

  /**
   * Get current cart items
   */
  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Get cart summary
   */
  getCartSummary(): CartSummary {
    const items = this.cartItemsSubject.value;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      items,
      totalItems,
      totalAmount
    };
  }

  /**
   * Get total items count
   */
  getTotalItemsCount(): number {
    return this.cartItemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Check if cart is empty
   */
  isCartEmpty(): boolean {
    return this.cartItemsSubject.value.length === 0;
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.updateCart([]);
    console.log('Cart cleared');
  }

  /**
   * Get item by ID
   */
  getItemById(productId: string): CartItem | undefined {
    return this.cartItemsSubject.value.find(item => item.id === productId);
  }
}
