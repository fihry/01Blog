import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"

@Component({
    selector: "app-explore",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen pt-5 mt-5">
      <div class="container-m mx-auto p-4">
        
        <!-- Search Header -->
        <div class="mb-5">
          <h1 class="text-3xl font-bold text-foreground mb-4">Explore</h1>
          
          <!-- Search Bar -->
          <div class="app-widget-card p-3">
            <div class="input-group">
              <span class="input-group-text bg-transparent border-0">
                <i class="bi bi-search text-muted-foreground"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-0 shadow-none" 
                placeholder="Search posts, topics, or users..."
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
              >
            </div>
          </div>
        </div>

        <div class="row g-4">
          
          <!-- Main Content -->
          <div class="col-lg-8">
            
            <!-- Trending Topics -->
            <div class="mb-5">
              <h2 class="text-xl font-bold text-foreground mb-3">Trending Topics</h2>
              <div class="d-flex flex-wrap gap-2">
                <a 
                  *ngFor="let topic of trendingTopics" 
                  [routerLink]="['/search']"
                  [queryParams]="{q: topic.name}"
                  class="badge bg-secondary text-secondary-foreground px-3 py-2 text-decoration-none hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  #{{ topic.name }}
                  <span class="ms-2 opacity-75 text-xs">{{ topic.count }}</span>
                </a>
              </div>
            </div>

            <!-- Recent Posts -->
            <div>
              <h2 class="text-xl font-bold text-foreground mb-3">Recent Posts</h2>
              <div class="d-flex flex-column gap-3">
                <div *ngFor="let post of recentPosts" class="app-widget-card p-4 hover:bg-muted/50 transition">
                  <a [routerLink]="['/post', post.id]" class="text-decoration-none">
                    <div class="d-flex gap-3 mb-3">
                      <div class="avatar-placeholder w-10 h-10"></div>
                      <div>
                        <p class="font-semibold text-sm text-foreground m-0">{{ post.author }}</p>
                        <p class="text-xs text-muted-foreground m-0">{{ post.timestamp }}</p>
                      </div>
                    </div>
                    <h3 class="text-lg font-bold text-foreground mb-2 hover:text-primary transition-colors">{{ post.title }}</h3>
                    <p class="text-muted-foreground text-sm line-clamp-2 mb-3">{{ post.content }}</p>
                    <div class="d-flex gap-2">
                      <span class="badge bg-secondary text-secondary-foreground" *ngFor="let tag of post.tags">{{ tag }}</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            
            <!-- Suggested Users -->
            <div class="app-widget-card p-4 mb-4">
              <h3 class="text-lg font-bold text-foreground mb-3">Suggested Users</h3>
              <div class="d-flex flex-column gap-3">
                <div *ngFor="let user of suggestedUsers" class="d-flex align-items-center gap-3">
                  <div class="avatar-placeholder w-10 h-10 flex-shrink-0"></div>
                  <div class="flex-grow-1 min-w-0">
                    <p class="font-semibold text-sm text-foreground m-0 text-truncate">{{ user.name }}</p>
                    <p class="text-xs text-muted-foreground m-0">{{ user.followers }} followers</p>
                  </div>
                  <button class="btn btn-sm btn-outline-secondary flex-shrink-0">Follow</button>
                </div>
              </div>
            </div>

            <!-- Popular Tags -->
            <div class="app-widget-card p-4">
              <h3 class="text-lg font-bold text-foreground mb-3">Popular Tags</h3>
              <div class="d-flex flex-column gap-2">
                <a 
                  *ngFor="let tag of popularTags" 
                  [routerLink]="['/search']"
                  [queryParams]="{q: tag.name}"
                  class="d-flex justify-content-between align-items-center text-decoration-none hover:bg-muted/50 p-2 rounded transition"
                >
                  <span class="text-foreground font-medium text-sm">#{{ tag.name }}</span>
                  <span class="text-muted-foreground text-xs">{{ tag.posts }} posts</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `,
})
export class ExploreComponent {
    searchQuery = '';

    trendingTopics = [
        { name: 'angular', count: 1234 },
        { name: 'typescript', count: 987 },
        { name: 'webdev', count: 756 },
        { name: 'javascript', count: 654 },
        { name: 'frontend', count: 543 },
    ];

    recentPosts = [
        {
            id: 1,
            author: 'John Doe',
            timestamp: '2 hours ago',
            title: 'Getting Started with Angular Signals',
            content: 'Angular Signals are a new reactive primitive that can improve performance and developer experience...',
            tags: ['angular', 'signals']
        },
        {
            id: 2,
            author: 'Jane Smith',
            timestamp: '5 hours ago',
            title: 'TypeScript Best Practices in 2024',
            content: 'Here are some essential TypeScript patterns and practices that every developer should know...',
            tags: ['typescript', 'best-practices']
        },
        {
            id: 3,
            author: 'Mike Johnson',
            timestamp: '1 day ago',
            title: 'Building Responsive Layouts with CSS Grid',
            content: 'CSS Grid is a powerful tool for creating complex, responsive layouts with minimal code...',
            tags: ['css', 'webdev']
        }
    ];

    suggestedUsers = [
        { name: 'Sarah Williams', followers: '2.3k' },
        { name: 'David Brown', followers: '1.8k' },
        { name: 'Emma Davis', followers: '1.5k' },
    ];

    popularTags = [
        { name: 'webdev', posts: 2345 },
        { name: 'javascript', posts: 1987 },
        { name: 'react', posts: 1654 },
        { name: 'nodejs', posts: 1432 },
        { name: 'css', posts: 1234 },
    ];

    onSearch() {
        console.log('Searching for:', this.searchQuery);
        // In a real app, this would trigger an API call
    }
}
