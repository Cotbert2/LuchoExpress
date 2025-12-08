export interface ProductResponse {
  id: string;
  categoryId: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  category?: CategoryResponse;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithProductsResponse {
  category: CategoryResponse;
  products: ProductResponse[];
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

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface ProductExistsResponse {
  exists: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
