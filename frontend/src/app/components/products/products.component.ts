import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { ProductResponse, CategoryWithProductsResponse } from '../../interfaces/product.interface';
import { ProductComponent } from '../product/product.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    ProductComponent,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    FormsModule
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
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
    this.router.navigate(['/products', product.id]);
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
  onAddToCart(event: any): void {
    console.log('Producto agregado al carrito:', event);
    // Aquí puedes implementar la lógica para agregar al carrito
    // Por ejemplo, usar un servicio de carrito
  }

  /**
   * Ir a la página de checkout
   */
  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
