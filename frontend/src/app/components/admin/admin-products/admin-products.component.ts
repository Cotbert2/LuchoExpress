import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ProductManagementService, 
  CategoryResponse, 
  ProductResponse, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  CreateProductRequest,
  UpdateProductRequest
} from '../../../services/product-management.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { SelectModule } from 'primeng/select';

import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-admin-products',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    SkeletonModule,
    TagModule,
    ImageModule,
    SelectModule
  ],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class AdminProductsComponent implements OnInit {
  // Categories
  categories: CategoryResponse[] = [];
  categoriesLoading = false;
  categoryDialog = false;
  categoryForm: CreateCategoryRequest = { name: '', description: '' };
  editingCategory: CategoryResponse | null = null;

  // Products
  products: ProductResponse[] = [];
  productsLoading = false;
  productDialog = false;
  productForm: CreateProductRequest = { 
    categoryId: '', 
    name: '', 
    imageUrl: '', 
    description: '', 
    price: 0 
  };
  editingProduct: ProductResponse | null = null;

  // For dropdowns
  categoryOptions: any[] = [];

  constructor(
    private productManagementService: ProductManagementService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  // Category methods
  loadCategories() {
    this.categoriesLoading = true;
    this.productManagementService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.updateCategoryOptions();
        this.categoriesLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load categories'
        });
        this.categoriesLoading = false;
      }
    });
  }

  updateCategoryOptions() {
    this.categoryOptions = this.categories.map(cat => ({
      label: cat.name,
      value: cat.id
    }));
  }

  openNewCategoryDialog() {
    this.categoryForm = { name: '', description: '' };
    this.editingCategory = null;
    this.categoryDialog = true;
  }

  editCategory(category: CategoryResponse) {
    this.categoryForm = { 
      name: category.name, 
      description: category.description || '' 
    };
    this.editingCategory = category;
    this.categoryDialog = true;
  }

  saveCategoryDialog() {
    if (!this.categoryForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Category name is required'
      });
      return;
    }

    if (this.editingCategory) {
      // Update
      const updateData: UpdateCategoryRequest = {
        name: this.categoryForm.name,
        description: this.categoryForm.description
      };
      
      this.productManagementService.updateCategory(this.editingCategory.id, updateData).subscribe({
        next: (updatedCategory) => {
          const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
          }
          this.updateCategoryOptions();
          this.categoryDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category updated successfully'
          });
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not update category'
          });
        }
      });
    } else {
      // Create
      this.productManagementService.createCategory(this.categoryForm).subscribe({
        next: (newCategory) => {
          this.categories.push(newCategory);
          this.updateCategoryOptions();
          this.categoryDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category created successfully'
          });
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not create category'
          });
        }
      });
    }
  }

  hideCategoryDialog() {
    this.categoryDialog = false;
    this.editingCategory = null;
  }

  // Product methods
  loadProducts() {
    this.productsLoading = true;
    this.productManagementService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.productsLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load products'
        });
        this.productsLoading = false;
      }
    });
  }

  openNewProductDialog() {
    if (this.categories.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Categories',
        detail: 'Please create at least one category before adding products'
      });
      return;
    }
    
    this.productForm = { 
      categoryId: '', 
      name: '', 
      imageUrl: '', 
      description: '', 
      price: 0 
    };
    this.editingProduct = null;
    this.productDialog = true;
  }

  editProduct(product: ProductResponse) {
    this.productForm = { 
      categoryId: product.categoryId,
      name: product.name, 
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      price: product.price
    };
    this.editingProduct = product;
    this.productDialog = true;
  }

  saveProductDialog() {
    if (!this.productForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Product name is required'
      });
      return;
    }

    if (!this.productForm.categoryId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Category is required'
      });
      return;
    }

    if (this.productForm.price <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Price must be greater than zero'
      });
      return;
    }

    if (this.editingProduct) {
      // Update
      const updateData: UpdateProductRequest = {
        categoryId: this.productForm.categoryId,
        name: this.productForm.name,
        imageUrl: this.productForm.imageUrl,
        description: this.productForm.description,
        price: this.productForm.price
      };
      
      this.productManagementService.updateProduct(this.editingProduct.id, updateData).subscribe({
        next: (updatedProduct) => {
          const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
          }
          this.productDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product updated successfully'
          });
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not update product'
          });
        }
      });
    } else {
      // Create
      this.productManagementService.createProduct(this.productForm).subscribe({
        next: (newProduct) => {
          this.products.push(newProduct);
          this.productDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product created successfully'
          });
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not create product'
          });
        }
      });
    }
  }

  hideProductDialog() {
    this.productDialog = false;
    this.editingProduct = null;
  }

  // Utility methods
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CO');
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }
}
