import { Component } from "@angular/core"
import { RouterModule } from "@angular/router"

@Component({
    selector: "app-not-found",
    standalone: true,
    imports: [RouterModule],
    template: `
    <div class="min-h-screen d-flex align-items-center justify-content-center bg-background">
      <div class="container-m mx-auto p-4">
        <div class="text-center max-w-2xl mx-auto">
          
          <!-- 404 Illustration -->
          <div class="mb-5">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-muted/50 mb-4" 
                 style="width: 180px; height: 180px;">
              <i class="bi bi-compass text-muted-foreground" style="font-size: 80px;"></i>
            </div>
            <h1 class="text-6xl font-bold text-foreground mb-3">404</h1>
            <h2 class="text-2xl font-bold text-foreground mb-3">Page Not Found</h2>
            <p class="text-lg text-muted-foreground mb-5">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="app-widget-card p-5 mb-5">
            <h3 class="text-lg font-bold text-foreground mb-4">Quick Links</h3>
            <div class="row g-3">
              <div class="col-md-6">
                <a routerLink="/feed" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2">
                  <i class="bi bi-house-door"></i>
                  <span>Home Feed</span>
                </a>
              </div>
              <div class="col-md-6">
                <a routerLink="/explore" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2">
                  <i class="bi bi-compass"></i>
                  <span>Explore</span>
                </a>
              </div>
              <div class="col-md-6">
                <a routerLink="/notifications" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2">
                  <i class="bi bi-bell"></i>
                  <span>Notifications</span>
                </a>
              </div>
              <div class="col-md-6">
                <a routerLink="/settings" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2">
                  <i class="bi bi-gear"></i>
                  <span>Settings</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Go Back Button -->
          <button onclick="history.back()" class="btn btn-primary px-5">
            <i class="bi bi-arrow-left me-2"></i>
            Go Back
          </button>

        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent { }
