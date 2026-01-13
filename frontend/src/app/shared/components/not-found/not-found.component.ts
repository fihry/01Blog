import { Component } from "@angular/core"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen d-flex align-items-center justify-content-center bg-background">
      <div class="container-xl mx-auto p-4">
        <div class="text-center max-w-2xl mx-auto">
          
          <!-- 404 Illustration -->
          <div class="mb-5">
            <div class="mx-auto mb-4" style="max-width: 400px;">
              <img src="assets/images/404-illustration.png" alt="404 Illustration" class="img-fluid">
            </div>
            <h1 class="text-4xl font-bold text-foreground mb-2">Page Not Found</h1>
            <p class="text-lg text-muted-foreground mb-5">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="app-widget-card p-5 mb-5">
            <h3 class="text-lg font-bold text-foreground mb-4">Quick Links</h3>
            <div class="row g-3">
              <div class="col-md-6">
                <a routerLink="/feed" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-3">
                  <i class="bi bi-house-door"></i>
                  <span>Back to Feed</span>
                </a>
              </div>
              <div class="col-md-6">
                <a routerLink="/notifications" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-3">
                  <i class="bi bi-bell"></i>
                  <span>Notifications</span>
                </a>
              </div>
              <div class="col-md-6">
                <a routerLink="/settings" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-3">
                  <i class="bi bi-gear"></i>
                  <span>Settings</span>
                </a>
              </div>
               <div class="col-md-6">
                <button onclick="history.back()" class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3">
                    <i class="bi bi-arrow-left"></i>
                    <span>Go Back</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent { }
