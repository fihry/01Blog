import { Component } from "@angular/core"

@Component({
  selector: "app-toast",
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 space-y-2">
      <!-- Toast notifications will appear here -->
    </div>
  `,
})
export class ToastComponent {}
