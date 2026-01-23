import { Component } from "@angular/core"
import { Router, RouterOutlet } from "@angular/router"
import { NavbarComponent } from "../app/shared/components/navbar/navbar.component"
import { ToastComponent } from "./shared/toast/toast.component" 
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-root",
  standalone: true,
imports: [CommonModule, RouterOutlet, NavbarComponent,ToastComponent],
  template: `
    <app-navbar *ngIf="!isAuthRoute()"></app-navbar>
    <main>
        <router-outlet></router-outlet>
    </main>
    <app-toast></app-toast>
  `,
})
export class AppComponent {
  title = "blog-app"

  constructor(private router: Router) { }
  isAuthRoute(): boolean {
    const currentUrl = this.router.url;
    // Hide navbar on /login, /register, or any other specific routes
    return currentUrl.startsWith('/login') ||
      currentUrl.startsWith('/register');
  }
}
