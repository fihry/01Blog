import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  FormBuilder,  FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import {  Router, RouterLink } from "@angular/router"
import  { AuthService } from "../../../core/services/auth.service"
@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-950">
      <div class="w-full max-w-md">
        <div class="bg-slate-900 rounded-lg shadow-xl p-8 border border-slate-800">
          <h2 class="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p class="text-slate-400 mb-8">Join BlogHub today</p>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-slate-300 text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                formControlName="username"
                class="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

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
              [disabled]="registerForm.invalid"
              class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              Create Account
            </button>
          </form>

          <p class="text-center text-slate-400 mt-6">
            Already have an account?
            <a routerLink="/login" class="text-cyan-400 hover:text-cyan-300">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      username: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => this.router.navigate(["/feed"]),
        error: (err) => console.error("Registration failed:", err),
      })
    }
  }
}
