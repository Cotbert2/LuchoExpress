import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TrackingStatus, TrackingResponse, TrackingError } from '../interfaces/tracking.interface';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private readonly apiUrl = `${environment.trackingApiUrl}/api/tracking`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getTrackingStatus(orderNumber: string): Observable<TrackingResponse> {
    const startTime = performance.now();
    
    // Crear headers con JWT token
    const headers = this.createAuthHeaders();
    
    return this.http.get<TrackingStatus>(`${this.apiUrl}/${orderNumber}`, { headers }).pipe(
      map((data: TrackingStatus) => {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        return {
          data,
          responseTime
        } as TrackingResponse;
      }),
      catchError((error) => {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        // Include response time even in error cases
        const enhancedError = {
          ...error,
          responseTime
        };
        
        return throwError(() => enhancedError);
      })
    );
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available. Please log in.');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
