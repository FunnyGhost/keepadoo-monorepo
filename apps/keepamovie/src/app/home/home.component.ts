import { Component } from '@angular/core';
import { AuthService } from '../state/auth.service';
import { SessionQuery } from '../state/session.query';

@Component({
  selector: 'keepadoo-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$;

  constructor(private authService: AuthService, private sessionQuery: SessionQuery) {}

  signOut(): void {
    this.authService.signOut();
  }
}
