import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: string;
  enabled?: boolean;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt: string;
}

export interface UserFilters {
  role?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.authUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/users`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/users/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createUser(request: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/users`, request, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.API_URL}/users/${id}`, request, {
      headers: this.authService.getAuthHeaders()
    });
  }

  disableUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/users/${id}/disable`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  filterUsers(users: UserResponse[], filters: UserFilters): UserResponse[] {
    return users.filter(user => {
      if (filters.role && user.role !== filters.role) {
        return false;
      }
      if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  getAvailableRoles(currentUserRole: string): string[] {
    if (currentUserRole === 'ROOT') {
      return ['ROOT', 'ADMIN', 'USER'];
    } else if (currentUserRole === 'ADMIN') {
      return ['ADMIN', 'USER'];
    }
    return ['USER'];
  }
}
