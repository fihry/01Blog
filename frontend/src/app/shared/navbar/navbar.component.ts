import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, Router } from "@angular/router"
import { AuthService } from "../../core/services/auth.service"

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <div class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              BlogHub
            </div>
          </div>

          <div class="flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search posts..."
              class="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700
                     focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div class="flex items-center gap-4">
            <button *ngIf="!(isAuthenticated$ | async)"
                    [routerLink]="['/login']"
                    class="px-4 py-2 text-cyan-400 hover:text-cyan-300 transition">
              Sign In
            </button>

            <button *ngIf="!(isAuthenticated$ | async)"
                    [routerLink]="['/register']"
                    class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition">
              Sign Up
            </button>

            <button *ngIf="isAuthenticated$ | async"
                    (click)="logout()"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  isAuthenticated$;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
