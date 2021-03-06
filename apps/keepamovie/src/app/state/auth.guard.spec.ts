import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { SessionQuery } from './session.query';
import { SessionStore } from './session.store';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let query: SessionQuery;
  let store: SessionStore;

  beforeEach(() => {
    const sessionStoreMock: Partial<SessionStore> = {
      update: () => {
        /* dummy function*/
      }
    };

    const sessionQueryMock: Partial<SessionQuery> = {
      isLoggedIn: () => false
    };

    const routerMock = {
      navigateByUrl: () => {
        /* dummy function*/
      }
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: SessionQuery, useValue: sessionQueryMock },
        { provide: SessionStore, useValue: sessionStoreMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    query = TestBed.inject(SessionQuery);
    store = TestBed.inject(SessionStore);
  });

  test('should return true if the user is logged in', () => {
    jest.spyOn(query, 'isLoggedIn').mockReturnValue(true);

    const result = guard.canActivate(null, {
      url: 'some-url-here'
    } as RouterStateSnapshot);

    expect(result).toBe(true);
  });

  describe('NotLoggedIn', () => {
    beforeEach(() => {
      jest.spyOn(query, 'isLoggedIn').mockReturnValue(false);
    });

    test('should return false if the user is not logged in', () => {
      const result = guard.canActivate(null, {
        url: 'some-url-here'
      } as RouterStateSnapshot);

      expect(result).toBe(false);
    });

    test('should redirect to login if the user is not logged in', () => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigateByUrl');

      guard.canActivate(null, { url: 'some-url-here' } as RouterStateSnapshot);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    test('should set the redirectUrl in the store', () => {
      const urlToUse = 'some-url-here';
      jest.spyOn(store, 'update');

      guard.canActivate(null, { url: urlToUse } as RouterStateSnapshot);

      expect(store.update).toHaveBeenCalledWith({
        redirectUrl: urlToUse
      });
    });
  });
});
