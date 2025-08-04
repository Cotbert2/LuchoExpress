import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TrackingStatus, TrackingResponse, TrackingError } from '../interfaces/tracking.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private readonly apiUrl = `${environment.trackingApiUrl}/api/tracking`;

  constructor(private http: HttpClient) {}

  getTrackingStatus(orderNumber: string): Observable<TrackingResponse> {
    const startTime = performance.now();
    
    return this.http.get<TrackingStatus>(`${this.apiUrl}/${orderNumber}`).pipe(
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
}
