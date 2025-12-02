import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <h1>{{ title() }}</h1>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['../assets/styles/global.css'] // fixed path
})
export class App {
  protected readonly title = signal('01blog - Angular + PrimeNG');
}
