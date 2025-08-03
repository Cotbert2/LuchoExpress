import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CreateCustomerRequest {
  documentId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CustomerResponse {
  id: string;
  documentId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CustomerExistsResponse {
  exists: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly baseUrl = `${environment.customersUrl}/api/customers`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new customer
   */
  createCustomer(customerData: CreateCustomerRequest): Observable<CustomerResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<CustomerResponse>(this.baseUrl, customerData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all customers
   */
  getAllCustomers(): Observable<CustomerResponse[]> {
    return this.http.get<CustomerResponse[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get customer by email
   */
  getCustomerByEmail(email: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.baseUrl}/email/${encodeURIComponent(email)}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update customer
   */
  updateCustomer(id: string, customerData: UpdateCustomerRequest): Observable<CustomerResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<CustomerResponse>(`${this.baseUrl}/${id}`, customerData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Check if customer exists
   */
  customerExists(id: string): Observable<CustomerExistsResponse> {
    return this.http.get<CustomerExistsResponse>(`${this.baseUrl}/${id}/exists`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 400) {
        errorMessage = error.error?.message || 'Bad request - please check your data';
      } else if (error.status === 404) {
        errorMessage = 'Customer not found';
      } else if (error.status === 409) {
        errorMessage = 'Customer already exists with this email or document ID';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error - please try again later';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('CustomerService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
