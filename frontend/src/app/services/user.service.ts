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
  // Only password is updatable in backend
  password?: string;
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
  enabled?: boolean | null;
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

  disableUser(id: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/${id}/disable`, {}, {
      headers: this.authService.getAuthHeaders(),
      responseType: 'text' as 'json'
    });
  }

  enableUser(id: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/${id}/enable`, {}, {
      headers: this.authService.getAuthHeaders(),
      responseType: 'text' as 'json'
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
      if (filters.enabled !== null && filters.enabled !== undefined && user.enabled !== filters.enabled) {
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
