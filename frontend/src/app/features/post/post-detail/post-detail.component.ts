import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule } from "@angular/router"

@Component({
    selector: "app-post-detail",
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen pt-5 mt-5">
      <div class="container-m mx-auto py-5 px-4">
        
        <!-- Back Button -->
        <a routerLink="/feed" class="btn btn-ghost mb-4 ps-0 text-muted-foreground hover:text-foreground">
            <i class="bi bi-arrow-left me-2"></i> Back to Feed
        </a>

        <!-- Main Content -->
        <div class="row g-5">
            <div class="col-lg-8">
                <!-- Post Config/Header -->
                <div class="mb-4">
                    <div class="d-flex align-items-center gap-3 mb-4">
                        <div class="avatar-placeholder w-12 h-12"></div>
                        <div class="d-flex flex-column">
                            <span class="text-foreground font-semibold">Author Name</span>
                            <span class="text-muted-foreground text-sm">Published on Oct 12, 2025 · 5 min read</span>
                        </div>
                    </div>

                    <h1 class="text-4xl font-bold text-foreground mb-4 leading-tight">
                        The Future of Angular: Signals and Beyond
                    </h1>
                    
                    <div class="d-flex gap-2 mb-4">
                        <span class="badge bg-secondary text-secondary-foreground">Technology</span>
                        <span class="badge bg-secondary text-secondary-foreground">Web Dev</span>
                    </div>

                    <!-- Featured Image Placeholder -->
                    <div class="w-100 bg-muted rounded-4 h-64 mb-5 d-flex align-items-center justify-content-center text-muted-foreground">
                        <i class="bi bi-image text-4xl opacity-50"></i>
                    </div>
                </div>

                <!-- Post Body -->
                <article class="prose prose-lg text-foreground mb-5">
                    <p class="mb-4 text-lg leading-relaxed text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p class="mb-4 text-lg leading-relaxed text-muted-foreground">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <h3 class="text-2xl font-bold text-foreground mt-8 mb-4">Why Signals Matter</h3>
                    <p class="mb-4 text-lg leading-relaxed text-muted-foreground">
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                </article>

                <hr class="border-muted my-5">

                <!-- Comments Section -->
                <div class="comments-section">
                    <h3 class="text-xl font-bold mb-4">Comments (12)</h3>
                    
                    <!-- Comment Input -->
                    <div class="d-flex gap-3 mb-5">
                        <div class="avatar-placeholder w-10 h-10"></div>
                        <div class="flex-grow-1">
                            <textarea class="form-control mb-2" rows="3" placeholder="Add to the discussion..."></textarea>
                            <button class="btn btn-primary float-end">Post Comment</button>
                        </div>
                    </div>

                    <!-- Comment List -->
                    <div class="d-flex flex-column gap-4">
                        <!-- Comment Item -->
                        <div class="d-flex gap-3">
                            <div class="avatar-placeholder w-10 h-10"></div>
                            <div>
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <span class="font-semibold text-sm">Jane Doe</span>
                                    <span class="text-xs text-muted-foreground">2 hours ago</span>
                                </div>
                                <p class="text-sm text-foreground mb-2">
                                    This is a fantastic article! I really enjoyed the deep dive into Signals.
                                </p>
                                <button class="btn btn-ghost btn-sm p-0 text-muted-foreground hover:text-primary">
                                    <i class="bi bi-reply me-1"></i> Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4 d-none d-lg-block">
                <div class="app-widget-card p-4 sticky-top" style="top: 100px;">
                    <h4 class="text-lg font-bold mb-3">About the Author</h4>
                    <p class="text-sm text-muted-foreground mb-4">
                        Senior Frontend Engineer passionate about performance and user experience.
                    </p>
                    <button class="btn btn-outline-secondary w-100 mb-4">Follow</button>
                    
                    <h5 class="text-sm font-semibold mb-3">More from Author</h5>
                    <ul class="list-unstyled d-flex flex-column gap-3">
                        <li>
                            <a href="#" class="text-sm font-medium text-foreground text-decoration-none hover:text-primary">
                                Understanding Dependency Injection
                            </a>
                            <p class="text-xs text-muted-foreground m-0">Oct 05 · 4 min read</p>
                        </li>
                        <li>
                            <a href="#" class="text-sm font-medium text-foreground text-decoration-none hover:text-primary">
                                RXJS Operators You Should Know
                            </a>
                            <p class="text-xs text-muted-foreground m-0">Sep 28 · 6 min read</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

      </div>
    </div>
  `,
    styles: [`
    .prose {
        max-width: 65ch;
    }
  `]
})
export class PostDetailComponent implements OnInit {
    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            console.log('Post ID:', params['id']);
        });
    }
}
