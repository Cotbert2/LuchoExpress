import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
        IonBadge, 
        IonSelectOption} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  searchOutline, 
  eyeOutline, 
  filterOutline,
  cubeOutline 
} from 'ionicons/icons';
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { ProductResponse, CategoryWithProductsResponse } from '../../interfaces/product.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
   IonHeader,
        IonToolbar,
        IonButtons,
        IonSelectOption,
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
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  
  products: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  categories: any[] = [];
  selectedCategory: any = null;
  searchTerm: string = '';
  selectedProductId: string | null = null;
  selectedProduct: ProductResponse | null = null;
  showProductDetail: boolean = false;

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Register Ionicons
    addIcons({
      searchOutline,
      eyeOutline,
      filterOutline,
      cubeOutline
    });
  }

  ngOnInit(): void {
    // Verificar si hay un ID de producto en la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectedProductId = params['id'];
        this.loadSelectedProduct();
      } else {
        this.loadAllProducts();
      }
    });
  }

  /**
   * Cargar todos los productos y categorías
   */
  loadAllProducts(): void {
    this.productsService.getCategoriesWithProducts().subscribe({
      next: (data: CategoryWithProductsResponse[]) => {
        this.products = [];
        this.categories = [{ label: 'All categories', value: null }];
        
        data.forEach(categoryWithProducts => {
          // Agregar productos
          this.products.push(...categoryWithProducts.products);
          
          // Agregar categoría al dropdown
          this.categories.push({
            label: categoryWithProducts.category.name,
            value: categoryWithProducts.category.id
          });
        });
        
        this.filteredProducts = [...this.products];
        console.log('Productos cargados:', this.products);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  /**
   * Cargar un producto específico y mostrar su detalle
   */
  loadSelectedProduct(): void {
    if (this.selectedProductId) {
      // Cargar todos los productos y buscar el específico
      this.productsService.getAllProducts().subscribe({
        next: (products: ProductResponse[]) => {
          const foundProduct = products.find(product => product.id === this.selectedProductId);
          if (foundProduct) {
            this.selectedProduct = foundProduct;
            this.showProductDetail = true;
            console.log('Producto seleccionado:', foundProduct);
          } else {
            console.error('Producto no encontrado');
            // Si no se encuentra el producto, mostrar todos los productos
            this.router.navigate(['/products']);
          }
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          // Si hay error, mostrar todos los productos
          this.router.navigate(['/products']);
        }
      });
    }
  }

  /**
   * Filtrar productos por término de búsqueda y categoría
   */
  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesCategory = !this.selectedCategory || 
        product.categoryId === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  /**
   * Manejar cambio en el término de búsqueda
   */
  onSearchChange(): void {
    this.filterProducts();
  }

  /**
   * Manejar cambio en la categoría seleccionada
   */
  onCategoryChange(): void {
    this.filterProducts();
  }

  /**
   * Mostrar detalle de un producto
   */
  showProductDetails(product: ProductResponse): void {
    this.router.navigate(['/product', product.id]);
  }

  /**
   * Volver a la vista de lista de productos
   */
  backToProductsList(): void {
    this.showProductDetail = false;
    this.selectedProduct = null;
    this.selectedProductId = null;
    this.router.navigate(['/products']);
  }

  /**
   * Manejar evento de agregar al carrito
   */
  async onAddToCart(event: any): Promise<void> {
    console.log('Producto agregado al carrito:', event);
    
    if (!event || !event.product) {
      await this.showToast('Invalid product data', 'danger');
      return;
    }

    const quantity = event.cuantity || 1;
    
    // Agregar al carrito usando el servicio
    this.cartService.addToCart(event.product, quantity);
    
    // Mostrar mensaje de éxito
    await this.showToast(`${quantity} x ${event.product.name} added to cart`, 'success');
  }

  /**
   * Mostrar mensaje toast
   */
  async showToast(message: string, color: string = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  /**
   * Ir a la página de checkout
   */
  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
