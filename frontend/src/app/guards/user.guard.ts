// src/app/guards/user.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isUser()) {
      return true;
    }

    // Si no es user, lo mandamos a home
    this.router.navigate(['/home']);
    return false;
  }
}
