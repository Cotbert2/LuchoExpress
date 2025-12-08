import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { 
  ProductResponse, 
  CategoryResponse, 
  CategoryWithProductsResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ProductExistsResponse
} from '../interfaces/product.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly API_URL = environment.productsUrl; // Products microservice URL
  
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }


  createProduct(product: CreateProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.API_URL}/products`, product, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: string, product: UpdateProductRequest): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.API_URL}/products/${id}`, product, {
      headers: this.getHeaders()
    });
  }

  getProductById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.API_URL}/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  productExists(id: string): Observable<ProductExistsResponse> {
    return this.http.get<ProductExistsResponse>(`${this.API_URL}/products/${id}/exists`, {
      headers: this.getHeaders()
    });
  }


  createCategory(category: CreateCategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${this.API_URL}/categories`, category, {
      headers: this.getHeaders()
    });
  }

  updateCategory(id: string, category: UpdateCategoryRequest): Observable<CategoryResponse> {
    return this.http.patch<CategoryResponse>(`${this.API_URL}/categories/${id}`, category, {
      headers: this.getHeaders()
    });
  }

  getAllCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.API_URL}/categories`);
  }

  getCategoriesWithProducts(): Observable<CategoryWithProductsResponse[]> {
    return this.http.get<CategoryWithProductsResponse[]>(`${this.API_URL}/categories-with-products`);
  }

  getProductsByCategory(categoryId: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.API_URL}/categories/${categoryId}/products`, {
      headers: this.getHeaders()
    });
  }


  searchProductsByName(searchTerm: string): Observable<ProductResponse[]> {
    return this.getCategoriesWithProducts().pipe(
      map(categories => {
        const allProducts: ProductResponse[] = [];
        categories.forEach(cat => allProducts.push(...cat.products));
        return allProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }

  getAllProducts(): Observable<ProductResponse[]> {
    return this.getCategoriesWithProducts().pipe(
      map(categories => {
        const allProducts: ProductResponse[] = [];
        categories.forEach(cat => allProducts.push(...cat.products));
        return allProducts;
      })
    );
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<ProductResponse[]> {
    return this.getAllProducts().pipe(
      map(products => products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      ))
    );
  }
}
