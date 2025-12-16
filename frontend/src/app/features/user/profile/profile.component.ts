import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute } from "@angular/router"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-5 mt-5">
      <div class="container-m mx-auto py-5 px-4">
        <div class="app-widget-card p-5 max-w-2xl mx-auto shadow-sm">
          <div class="text-center mb-5">
            <div class="avatar-large-placeholder mx-auto mb-3"></div>
            <h1 class="text-3xl font-bold text-foreground">User Profile</h1>
            <p class="text-muted-foreground">@username</p>
          </div>

          <div class="row g-3 text-center mb-5">
            <div class="col-4">
                <div class="bg-accent rounded-3 p-3">
                    <p class="text-primary text-2xl font-bold m-0">25</p>
                    <p class="text-muted-foreground text-sm m-0">Posts</p>
                </div>
            </div>
            <div class="col-4">
                <div class="bg-accent rounded-3 p-3">
                    <p class="text-primary text-2xl font-bold m-0">156</p>
                    <p class="text-muted-foreground text-sm m-0">Followers</p>
                </div>
            </div>
            <div class="col-4">
                <div class="bg-accent rounded-3 p-3">
                    <p class="text-primary text-2xl font-bold m-0">89</p>
                    <p class="text-muted-foreground text-sm m-0">Following</p>
                </div>
            </div>
          </div>

          <button class="btn btn-primary w-100 py-2 fw-medium">
            Follow
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      console.log("User ID:", params["id"])
    })
  }
}
