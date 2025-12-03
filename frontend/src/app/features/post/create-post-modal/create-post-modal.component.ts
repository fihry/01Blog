import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-create-post-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-8 w-full max-w-2xl">
        <h2 class="text-2xl font-bold text-white mb-6">Create Post</h2>
        
        <form class="space-y-4">
          <div>
            <label class="block text-slate-300 mb-2">Title</label>
            <input type="text" placeholder="Post title" class="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-cyan-500 outline-none" />
          </div>
          
          <div>
            <label class="block text-slate-300 mb-2">Content</label>
            <textarea placeholder="Write your post here..." rows="6" class="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-cyan-500 outline-none"></textarea>
          </div>
          
          <div>
            <label class="block text-slate-300 mb-2">Tags</label>
            <input type="text" placeholder="Add tags separated by commas" class="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-cyan-500 outline-none" />
          </div>
          
          <div class="flex gap-3 justify-end">
            <button type="button" class="px-6 py-2 border border-slate-600 text-slate-300 rounded hover:border-slate-500">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">Publish Post</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreatePostModalComponent {}
