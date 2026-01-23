import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-t-white border-r-transparent"></div>
  `,
  styles: []
})
export class SpinnerComponent {}