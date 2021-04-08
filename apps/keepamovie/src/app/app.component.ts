import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './state/auth.service';

@Component({
  selector: 'keepadoo-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.initialize();
  }

  ngOnDestroy(): void {
    this.authService.destroy();
  }
}
