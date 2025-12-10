import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  mailOutline, 
  personOutline, 
  lockClosedOutline, 
  keyOutline, 
  logOutOutline 
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest, UserResponse } from '../../interfaces/auth.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentUser: UserResponse | null = null;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  changePasswordForm!: FormGroup;

  @Input() isLogin: boolean = true;

  isChangePasswordModalOpen = false;

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    // Register Ionicons
    addIcons({
      mailOutline,
      personOutline,
      lockClosedOutline,
      keyOutline,
      logOutOutline
    });
    
    this.initializeForms();
  }

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.changePasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors?.['passwordMismatch'];
      if (Object.keys(confirmPassword.errors || {}).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  switchToSignUp(): void {
    this.isLogin = !this.isLogin;
    this.resetForms();
  }

  openChangePasswordDialog(): void {
    this.changePasswordForm.reset();
    this.isChangePasswordModalOpen = true;
  }

  closeChangePasswordModal(): void {
    this.isChangePasswordModalOpen = false;
  }

  private resetForms(): void {
    this.loginForm.reset();
    this.registerForm.reset();
    this.changePasswordForm.reset();
  }

  handleSignUp(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.showToast('Please fill all required fields correctly', 'danger');
      return;
    }

    const registerData: RegisterRequest = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showToast('Account created successfully! You can now log in.');
          this.isLogin = true;
          this.resetForms();
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.showToast(error.error?.message || 'An error occurred while creating account', 'danger');
        }
      });
  }

  handleLogIn(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      this.showToast('Please fill all required fields correctly', 'danger');
      return;
    }

    const loginData: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showToast('Login successful!');
          // Redirect based on user role
          this.authService.getCurrentUser().subscribe({
            next: (user) => {
              if (user.role === 'PS') {
                this.router.navigate(['/personal-shopper/orders']);
              } else {
                this.router.navigate(['/home']);
              }
            }
          });
        },
        error: (error) => {
          console.error('Login error:', error);
          this.showToast(error.error?.message || 'Invalid username or password', 'danger');
        }
      });
  }

  handleLogOut(): void {
    this.authService.logout();
    this.showToast('You have been logged out successfully', 'warning');
  }

  handleChangePassword(): void {
    if (!this.currentUser?.id) return;
    if (this.changePasswordForm.invalid) {
      this.markFormGroupTouched(this.changePasswordForm);
      this.showToast('Please fill the form correctly', 'danger');
      return;
    }

    const newPassword = this.changePasswordForm.value.password;
    this.userService.updateUser(this.currentUser.id, { password: newPassword }).subscribe({
      next: () => {
        this.showToast('Password updated successfully');
        this.changePasswordForm.reset();
        this.isChangePasswordModalOpen = false;
      },
      error: (error) => {
        console.error('Change password error:', error);
        this.showToast('Failed to update password', 'danger');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  // Getters for form validation
  get loginUsername() { return this.loginForm.get('username'); }
  get loginPassword() { return this.loginForm.get('password'); }
  
  get registerUsername() { return this.registerForm.get('username'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
  get registerConfirmPassword() { return this.registerForm.get('confirmPassword'); }
  get newPassword() { return this.changePasswordForm.get('password'); }
  get confirmNewPassword() { return this.changePasswordForm.get('confirmPassword'); }
}
