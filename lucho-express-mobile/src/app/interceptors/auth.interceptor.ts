import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the service
    const authToken = this.authService.getToken();
    console.log('Interceptor - Request URL:', req.url);
    console.log('Interceptor - Token exists:', !!authToken);
    console.log('Interceptor - Token (first 50 chars):', authToken ? authToken.substring(0, 50) + '...' : 'null');

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (authToken && !req.url.includes('/auth/token') && !req.url.includes('/auth/register')) {
      console.log('Interceptor - Adding Authorization header');
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    } else {
      console.log('Interceptor - Not adding Authorization header. Reasons:', {
        noToken: !authToken,
        isTokenEndpoint: req.url.includes('/auth/token'),
        isRegisterEndpoint: req.url.includes('/auth/register')
      });
    }

    console.log('Interceptor - Final request headers:', authReq.headers.keys().map(key => `${key}: ${authReq.headers.get(key)}`));

    // Handle the request and catch errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Interceptor - HTTP Error:', error);
        if (error.status === 401) {
          // Token expired or invalid, logout user
          console.log('Interceptor - 401 error, logging out user');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
