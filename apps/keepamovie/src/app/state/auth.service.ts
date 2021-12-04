import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { User } from './models/user';
import { SessionQuery } from './session.query';
import { SessionStore } from './session.store';
import { Subscription } from 'rxjs';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authSubscription: Subscription;

  constructor(
    private sessionStore: SessionStore,
    private query: SessionQuery,
    private auth: Auth,
    private router: Router
  ) {}

  public initialize(): void {
    this.sessionStore.setLoading(true);
    this.authSubscription = authState(this.auth)
      .pipe(
        map((firebaseUser: FirebaseUser) => {
          if (firebaseUser) {
            const user: User = {
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              userId: firebaseUser.uid
            };

            return user;
          }
        })
      )
      .subscribe((data: User) => {
        if (data) {
          this.sessionStore.login(data);
          const redirectUrl = this.query.redirectUrl();
          this.router.navigateByUrl(redirectUrl).then();
        } else {
          this.sessionStore.logout();
        }
        this.sessionStore.setLoading(false);
      });
  }

  async signIn(email, password) {
    this.sessionStore.setLoading(true);

    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      this.sessionStore.setError(error.message);
    }

    this.sessionStore.setLoading(false);
  }

  async signUp(email, password) {
    this.sessionStore.setLoading(true);
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      this.sessionStore.setError(error.message);
    }

    this.sessionStore.setLoading(false);
  }

  async signOut() {
    await signOut(this.auth);
    return this.router.navigate(['/login']);
  }

  destroy(): void {
    this.authSubscription.unsubscribe();
  }
}
