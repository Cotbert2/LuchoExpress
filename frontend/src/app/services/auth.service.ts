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
    this.loadUserFromStorage();
  }

  /**
   * Login with username and password
   */
  login(loginRequest: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/token`, loginRequest)
      .pipe(
        tap((response: TokenResponse) => {
          this.setToken(response.accessToken);
          this.getCurrentUser().subscribe();
        })
      );
  }

  /**
   * Register a new user
   */
  register(registerRequest: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/register`, registerRequest);
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/me`)
      .pipe(
        tap((user: UserResponse) => {
          this.currentUserSubject.next(user);
          this.setUserInStorage(user);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Set token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  /**
   * Set user data in localStorage
   */
  private setUserInStorage(user: UserResponse): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * Load user from localStorage on service initialization
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        localStorage.removeItem('current_user');
      }
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (e) {
      return true;
    }
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
