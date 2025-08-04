import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Category interfaces
export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// Product interfaces
export interface ProductResponse {
  id: string;
  categoryId: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  category: CategoryResponse;
}

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: number;
}

export interface UpdateProductRequest {
  categoryId?: string;
  name?: string;
  imageUrl?: string;
  description?: string;
  price?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductManagementService {
  private readonly baseUrl = environment.productsUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get HTTP headers with authorization
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Category methods
  getAllCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.baseUrl}/categories`, {
      headers: this.getHeaders()
    });
  }

  createCategory(categoryData: CreateCategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${this.baseUrl}/categories`, categoryData, {
      headers: this.getHeaders()
    });
  }

  updateCategory(id: string, categoryData: UpdateCategoryRequest): Observable<CategoryResponse> {
    return this.http.patch<CategoryResponse>(`${this.baseUrl}/categories/${id}`, categoryData, {
      headers: this.getHeaders()
    });
  }

  // Product methods
  getAllProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.baseUrl}/products`, {
      headers: this.getHeaders()
    });
  }

  getProductById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  createProduct(productData: CreateProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.baseUrl}/products`, productData, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: string, productData: UpdateProductRequest): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.baseUrl}/products/${id}`, productData, {
      headers: this.getHeaders()
    });
  }
}
