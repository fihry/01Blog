import { Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { NavbarComponent } from "./shared/navbar/navbar.component"
import { ToastComponent } from "./shared/toast/toast.component"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="min-h-screen bg-slate-950">
      <router-outlet></router-outlet>
    </main>
    <app-toast></app-toast>
  `,
})
export class AppComponent {
  title = "blog-app"
}