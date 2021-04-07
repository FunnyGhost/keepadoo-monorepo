import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../state/auth.service';
import { SessionQuery } from '../state/session.query';

@Component({
  selector: 'keepadoo-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sessionQuery: SessionQuery
  ) {}

  goToAdd(): void {
    this.router.navigateByUrl(`${this.router.url}/add`);
  }

  signOut(): void {
    this.authService.signOut();
  }
}
