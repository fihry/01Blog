// src/app/modules/auth/components/login/login.component.ts

import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { SpinnerComponent } from "../../../shared/components/spinner/spinner.component"
import { ToastService } from "../../../shared/services/toast.service"

@Component({
  selector: "app-login",
  standalone: true,
  // 💡 Note: SpinnerComponent should be included here if you are using it in the template.
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrls: ["../auth.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  get emailControl(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    // Mark all controls as touched to trigger validation feedback on submit
    this.loginForm.markAllAsTouched();

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      // Destructure form values for cleaner subscription call
      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.showSuccess("Login Successful", "Welcome back to ZeroOneBlog!");
          this.router.navigate(["/feed"]);
        },
        error: (err) => {
          this.isLoading = false;
          // Use a generic message for security, regardless of the API error detail
          this.errorMessage = "Login failed: Invalid email or password.";
          this.toastService.showError("Authentication Failed", this.errorMessage);
          console.error("Login failed:", err);
        },
      });
    }
  }
}