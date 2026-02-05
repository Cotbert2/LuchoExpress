/**
 * Pruebas unitarias para ProductsService
 * 
 * Este archivo contiene todas las pruebas para el servicio de productos,
 * incluyendo CRUD de productos y categorías, búsquedas, y filtros.
 */
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService } from './products.service';
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

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  const API_URL = environment.productsUrl;
  const mockToken = 'mock-jwt-token';

  const mockCategory: CategoryResponse = {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Electronic devices',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  const mockProduct: ProductResponse = {
    id: 'prod-1',
    categoryId: 'cat-1',
    name: 'Laptop',
    imageUrl: 'https://example.com/laptop.jpg',
    description: 'High performance laptop',
    price: 1200,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    category: mockCategory
  };

  const mockCategoryWithProducts: CategoryWithProductsResponse = {
    category: mockCategory,
    products: [
      mockProduct,
      {
        id: 'prod-2',
        categoryId: 'cat-1',
        name: 'Mouse',
        price: 25,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService]
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(mockToken);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // PRUEBAS: Inicialización del servicio
  // Verifica que el servicio se cree correctamente
  describe('Service Initialization', () => {
    // Prueba: Verifica que el servicio se haya creado correctamente
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  // PRUEBAS: Crear productos
  // Verifican que los productos se creen correctamente con todos sus datos
  describe('createProduct', () => {
    const newProduct: CreateProductRequest = {
      categoryId: 'cat-1',
      name: 'New Laptop',
      imageUrl: 'https://example.com/new-laptop.jpg',
      description: 'Brand new laptop',
      price: 1500
    };

    // Prueba: Verifica que se cree un producto exitosamente con todos sus datos
    it('should create a product successfully', () => {
      service.createProduct(newProduct).subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(product.name).toBe(mockProduct.name);
      });

      const req = httpMock.expectOne(`${API_URL}/products`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(mockProduct);
    });

    // Prueba: Verifica que se pueda crear un producto sin campos opcionales
    it('should create product without optional fields', () => {
      const minimalProduct: CreateProductRequest = {
        categoryId: 'cat-1',
        name: 'Basic Product',
        price: 100
      };

      service.createProduct(minimalProduct).subscribe();

      const req = httpMock.expectOne(`${API_URL}/products`);
      expect(req.request.body).toEqual(minimalProduct);

      req.flush(mockProduct);
    });
  });

  // PRUEBAS: Crear categorías
  // Verifican que las categorías de productos se creen correctamente
  describe('createCategory', () => {
    const newCategory: CreateCategoryRequest = {
      name: 'New Category',
      description: 'Category description'
    };

    // Prueba: Verifica que se cree una categoría exitosamente
    it('should create category successfully', () => {
      service.createCategory(newCategory).subscribe(category => {
        expect(category).toEqual(mockCategory);
        expect(category.name).toBe(mockCategory.name);
      });

      const req = httpMock.expectOne(`${API_URL}/categories`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCategory);

      req.flush(mockCategory);
    });

    // Prueba: Verifica que se pueda crear una categoría sin descripción
    it('should create category without description', () => {
      const minimal: CreateCategoryRequest = { name: 'Minimal Category' };

      service.createCategory(minimal).subscribe();

      const req = httpMock.expectOne(`${API_URL}/categories`);
      expect(req.request.body).toEqual(minimal);

      req.flush(mockCategory);
    });
  });


  // PRUEBAS: Obtener categorías con sus productos
  // Verifican que se obtengan categorías junto con sus productos relacionados
  describe('getCategoriesWithProducts', () => {
    const mockCategoriesWithProducts: CategoryWithProductsResponse[] = [
      mockCategoryWithProducts,
      {
        category: { ...mockCategory, id: 'cat-2', name: 'Books' },
        products: []
      }
    ];

    // Prueba: Verifica que se obtengan categorías con sus productos asociados
    it('should get categories with products successfully', () => {
      service.getCategoriesWithProducts().subscribe(data => {
        expect(data.length).toBe(2);
        expect(data[0].products.length).toBe(2);
      });

      const req = httpMock.expectOne(`${API_URL}/categories-with-products`);
      expect(req.request.method).toBe('GET');

      req.flush(mockCategoriesWithProducts);
    });
  });

  // PRUEBAS: Obtener productos por categoría
  // Verifican que se obtengan todos los productos de una categoría específica
  describe('getProductsByCategory', () => {
    const categoryId = 'cat-1';
    const mockProducts: ProductResponse[] = [mockProduct];

    // Prueba: Verifica que se obtengan productos de una categoría específica
    it('should get products by category successfully', () => {
      service.getProductsByCategory(categoryId).subscribe(products => {
        expect(products.length).toBe(1);
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(`${API_URL}/categories/${categoryId}/products`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      req.flush(mockProducts);
    });
  });

  // PRUEBAS: Obtener todos los productos
  // Verifican que se obtengan todos los productos de todas las categorías
  describe('getAllProducts', () => {
    const mockCategoriesWithProducts: CategoryWithProductsResponse[] = [
      {
        category: mockCategory,
        products: [mockProduct, { ...mockProduct, id: 'prod-2' }]
      },
      {
        category: { ...mockCategory, id: 'cat-2', name: 'Books' },
        products: [{ ...mockProduct, id: 'prod-3' }]
      }
    ];

    // Prueba: Verifica que obtenga todos los productos sin importar la categoría
    it('should get all products from all categories', () => {
      service.getAllProducts().subscribe(products => {
        expect(products.length).toBe(3);
      });

      const req = httpMock.expectOne(`${API_URL}/categories-with-products`);
      req.flush(mockCategoriesWithProducts);
    });
  });

  // PRUEBAS: Filtrar productos por rango de precios
  // Verifican que se filtren productos dentro de un rango de precios específico
  describe('getProductsByPriceRange', () => {
    const mockCategoriesWithProducts: CategoryWithProductsResponse[] = [
      {
        category: mockCategory,
        products: [
          { ...mockProduct, id: 'prod-1', price: 100 },
          { ...mockProduct, id: 'prod-2', price: 500 },
          { ...mockProduct, id: 'prod-3', price: 1000 },
          { ...mockProduct, id: 'prod-4', price: 1500 }
        ]
      }
    ];

    // Prueba: Verifica que filtre productos dentro del rango de precio especificado
    it('should filter products by price range', () => {
      service.getProductsByPriceRange(200, 1000).subscribe(products => {
        expect(products.length).toBe(2);
        expect(products.every(p => p.price >= 200 && p.price <= 1000)).toBe(true);
      });

      const req = httpMock.expectOne(`${API_URL}/categories-with-products`);
      req.flush(mockCategoriesWithProducts);
    });

    // Prueba: Verifica que retorne array vacío si no hay productos en el rango
    it('should return empty array when no products in range', () => {
      service.getProductsByPriceRange(2000, 3000).subscribe(products => {
        expect(products.length).toBe(0);
      });

      const req = httpMock.expectOne(`${API_URL}/categories-with-products`);
      req.flush(mockCategoriesWithProducts);
    });

  });
});
