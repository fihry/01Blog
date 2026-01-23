// src/app/modules/auth/components/register/register.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['../auth.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      // Username validation: required, min 3 characters
      username: ['', [Validators.required, Validators.minLength(3)]],
      // Email validation: required, valid email format
      email: ['', [Validators.required, Validators.email]],
      // Password validation: required, min 6 characters
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  get usernameControl(): AbstractControl | null {
    return this.registerForm.get('username');
  }

  get emailControl(): AbstractControl | null {
    return this.registerForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.registerForm.get('password');
  }


  onSubmit(): void {
    // 1. Mark all controls as touched to trigger validation feedback immediately
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const { username, email, password } = this.registerForm.value;

      this.authService.register({ username, email, password }).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.showSuccess("Registration Successful", "Please log in to start blogging!");
          this.router.navigate(["/login"]);
        },
        error: (err) => {
          this.isLoading = false;
          const apiError = err.error?.message || "An unexpected error occurred during registration.";

          this.errorMessage = apiError;
          this.toastService.showError("Registration Failed", apiError);
          console.error("Registration failed:", err);
        },
      });
    }
  }
}