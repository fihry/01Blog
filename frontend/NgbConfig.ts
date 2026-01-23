import { NgbConfig } from '@ng-bootstrap/ng-bootstrap';

export class AppComponent {
  constructor(config: NgbConfig) {
    config.animation = true;
  }
}
