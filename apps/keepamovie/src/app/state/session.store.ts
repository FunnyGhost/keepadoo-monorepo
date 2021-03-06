import { Injectable } from '@angular/core';
import { resetStores, Store, StoreConfig } from '@datorama/akita';
import { createInitialState, createSession, SessionState } from './models/session-state';
import { User } from './models/user';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'session' })
export class SessionStore extends Store<SessionState> {
  constructor() {
    super(createInitialState());
    super.setLoading(false);
  }

  login(data: User): void {
    const user = createSession(data);
    this.update({ user });
  }

  logout(): void {
    resetStores();
  }
}
