import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute } from "@angular/router"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-950">
      <div class="max-w-2xl mx-auto py-8 px-4">
        <div class="bg-slate-900 rounded-lg shadow-xl p-8 border border-slate-800">
          <div class="text-center mb-8">
            <div class="w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-4"></div>
            <h1 class="text-3xl font-bold text-white">User Profile</h1>
            <p class="text-slate-400">@username</p>
          </div>

          <div class="grid grid-cols-3 gap-4 text-center mb-8">
            <div class="bg-slate-800 rounded-lg p-4">
              <p class="text-cyan-400 text-2xl font-bold">25</p>
              <p class="text-slate-400 text-sm">Posts</p>
            </div>
            <div class="bg-slate-800 rounded-lg p-4">
              <p class="text-cyan-400 text-2xl font-bold">156</p>
              <p class="text-slate-400 text-sm">Followers</p>
            </div>
            <div class="bg-slate-800 rounded-lg p-4">
              <p class="text-cyan-400 text-2xl font-bold">89</p>
              <p class="text-slate-400 text-sm">Following</p>
            </div>
          </div>

          <button class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition">
            Follow
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log("User ID:", params["id"])
    })
  }
}
