import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, TokenResponse, UserResponse } from '../interfaces/auth.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.authUrl;
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }


  private initializeAuth(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.loadUserFromStorage();
      this.getCurrentUser().subscribe({
        next: (data) => {
          console.log('User loaded successfully from token', data);
        },
        error: (err) => {
          console.error('Invalid token, clearing storage',err);
          this.logout();
        }
      });
    } else {
      this.logout();
    }
  }

  login(loginRequest: LoginRequest): Observable<TokenResponse> {
    console.log('Login request:', loginRequest);
    return this.http.post<TokenResponse>(`${this.API_URL}/token`, loginRequest)
      .pipe(
        tap((response: TokenResponse) => {
          console.log('Login response received:', response);
          this.setToken(response.accessToken);
          console.log('Token saved to localStorage');
          this.getCurrentUser().subscribe({
            next: (user) => {
              console.log('User loaded after login:', user);
            },
            error: (err) => {
              console.error('Error loading user after login:', err);
            }
          });
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/register`, registerRequest);
  }


  getCurrentUser(): Observable<UserResponse> {
    console.log('Fetching current user from server');
    const token = this.getToken();
    console.log('Token exists:', !!token);
    console.log('Token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'null');
    
    if (!token) {
      console.error('No token available for request');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log('Request headers:', headers);
    
    return this.http.get<UserResponse>(`${this.API_URL}/me`, { headers })
      .pipe(
        tap((user: UserResponse) => {
          console.log('User received from server:', user);
          this.currentUserSubject.next(user);
          this.setUserInStorage(user);
        })
      );
  }


  logout(): void {
    this.clearStorage();
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }


  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private setUserInStorage(user: UserResponse): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('current_user');
    const token = this.getToken();
    
    if (userStr && token && !this.isTokenExpired(token)) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        this.clearStorage();
      }
    } else {
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (e) {
      return true;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
