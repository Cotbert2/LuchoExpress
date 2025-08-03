/*
  EJEMPLO DE USO DEL PRODUCTS SERVICE
  
  Este archivo muestra cómo usar el ProductsService en un componente Angular.
  Los métodos implementados cubren todos los endpoints disponibles en el 
  microservicio de productos.
*/

import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { 
  ProductResponse, 
  CategoryResponse, 
  CategoryWithProductsResponse,
  CreateProductRequest,
  CreateCategoryRequest 
} from '../interfaces/product.interface';

@Component({
  selector: 'app-products-example',
  template: `
    <div class="products-container">
      <h2>Gestión de Productos</h2>
      
      <!-- Mostrar todas las categorías con productos -->
      <div *ngFor="let categoryWithProducts of categoriesWithProducts">
        <h3>{{ categoryWithProducts.category.name }}</h3>
        <p>{{ categoryWithProducts.category.description }}</p>
        
        <div class="products-grid">
          <div *ngFor="let product of categoryWithProducts.products" class="product-card">
            <img [src]="product.imageUrl" [alt]="product.name" *ngIf="product.imageUrl">
            <h4>{{ product.name }}</h4>
            <p>{{ product.description }}</p>
            <span class="price">\${{ product.price }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductsExampleComponent implements OnInit {
  categoriesWithProducts: CategoryWithProductsResponse[] = [];
  categories: CategoryResponse[] = [];
  allProducts: ProductResponse[] = [];

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadCategoriesWithProducts();
    this.loadAllCategories();
  }

  // ============== MÉTODOS PÚBLICOS (NO REQUIEREN AUTENTICACIÓN) ==============

  /**
   * Cargar todas las categorías con sus productos
   */
  loadCategoriesWithProducts(): void {
    this.productsService.getCategoriesWithProducts().subscribe({
      next: (data) => {
        this.categoriesWithProducts = data;
        console.log('Categorías con productos cargadas:', data);
      },
      error: (error) => {
        console.error('Error al cargar categorías con productos:', error);
      }
    });
  }

  /**
   * Cargar todas las categorías
   */
  loadAllCategories(): void {
    this.productsService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        console.log('Categorías cargadas:', data);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  /**
   * Buscar productos por nombre
   */
  searchProducts(searchTerm: string): void {
    this.productsService.searchProductsByName(searchTerm).subscribe({
      next: (products) => {
        console.log('Productos encontrados:', products);
        // Aquí puedes actualizar la vista con los productos filtrados
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
      }
    });
  }

  /**
   * Obtener todos los productos
   */
  loadAllProducts(): void {
    this.productsService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        console.log('Todos los productos:', products);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  /**
   * Filtrar productos por rango de precio
   */
  filterByPriceRange(minPrice: number, maxPrice: number): void {
    this.productsService.getProductsByPriceRange(minPrice, maxPrice).subscribe({
      next: (products) => {
        console.log(`Productos entre $${minPrice} y $${maxPrice}:`, products);
      },
      error: (error) => {
        console.error('Error al filtrar por precio:', error);
      }
    });
  }

  // ============== MÉTODOS ADMINISTRATIVOS (REQUIEREN AUTENTICACIÓN) ==============

  /**
   * Crear una nueva categoría (solo ADMIN/ROOT)
   */
  createNewCategory(): void {
    const newCategory: CreateCategoryRequest = {
      name: 'Nueva Categoría',
      description: 'Descripción de la nueva categoría'
    };

    this.productsService.createCategory(newCategory).subscribe({
      next: (category) => {
        console.log('Categoría creada:', category);
        this.loadAllCategories(); // Recargar categorías
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
        // Manejar errores de autorización (401/403)
      }
    });
  }

  /**
   * Crear un nuevo producto (solo ADMIN/ROOT)
   */
  createNewProduct(): void {
    // Asumiendo que tenemos una categoría disponible
    if (this.categories.length > 0) {
      const newProduct: CreateProductRequest = {
        categoryId: this.categories[0].id,
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        price: 99.99,
        imageUrl: 'https://example.com/image.jpg'
      };

      this.productsService.createProduct(newProduct).subscribe({
        next: (product) => {
          console.log('Producto creado:', product);
          this.loadCategoriesWithProducts(); // Recargar productos
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          // Manejar errores de autorización (401/403)
        }
      });
    }
  }

  /**
   * Actualizar un producto existente (solo ADMIN/ROOT)
   */
  updateProduct(productId: string): void {
    const updateData = {
      price: 149.99,
      description: 'Descripción actualizada'
    };

    this.productsService.updateProduct(productId, updateData).subscribe({
      next: (product) => {
        console.log('Producto actualizado:', product);
        this.loadCategoriesWithProducts(); // Recargar productos
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
      }
    });
  }

  /**
   * Obtener productos de una categoría específica (solo ADMIN/ROOT)
   */
  loadProductsByCategory(categoryId: string): void {
    this.productsService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        console.log('Productos de la categoría:', products);
      },
      error: (error) => {
        console.error('Error al cargar productos de categoría:', error);
      }
    });
  }

  /**
   * Verificar si un producto existe
   */
  checkProductExists(productId: string): void {
    this.productsService.productExists(productId).subscribe({
      next: (response) => {
        console.log(`Producto ${productId} existe:`, response.exists);
      },
      error: (error) => {
        console.error('Error al verificar existencia:', error);
      }
    });
  }

  /**
   * Obtener un producto específico por ID
   */
  loadProductById(productId: string): void {
    this.productsService.getProductById(productId).subscribe({
      next: (product) => {
        console.log('Producto cargado:', product);
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
      }
    });
  }
}
