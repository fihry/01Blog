import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-950">
      <div class="w-full max-w-md">
        <div class="bg-slate-900 rounded-lg shadow-xl p-8 border border-slate-800">
          <h2 class="text-3xl font-bold text-white mb-2">Sign In</h2>
          <p class="text-slate-400 mb-8">Welcome back to BlogHub</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label class="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                formControlName="password"
                class="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              [disabled]="loginForm.invalid"
              class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              Sign In
            </button>
          </form>

          <p class="text-center text-slate-400 mt-6">
            Don't have an account?
            <a routerLink="/register" class="text-cyan-400 hover:text-cyan-300">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(["/feed"]),
        error: (err) => console.error("Login failed:", err),
      })
    }
  }
}
