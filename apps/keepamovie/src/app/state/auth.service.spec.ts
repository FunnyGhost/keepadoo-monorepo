import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { testFirebaseUser, testUser } from '../../test-utilities/test-objects';
import { AuthService } from './auth.service';
import { SessionQuery } from './session.query';
import { SessionStore } from './session.store';

describe('AuthService', () => {
  let service: AuthService;
  let store: SessionStore;
  let query: SessionQuery;
  let router: Router;
  let angularFireAuthMock: any = {};

  beforeEach(() => {
    const sessionStoreMock: Partial<SessionStore> = {
      setLoading: () => {
        /* dummy function*/
      },
      setError: () => {
        /* dummy function*/
      },
      login: () => {
        /* dummy function*/
      },
      logout: () => {
        /* dummy function*/
      }
    };

    const redirectUrl = 'batcave';
    const sessionQueryMock: Partial<SessionQuery> = {
      redirectUrl: () => redirectUrl
    };

    const routerMock = {
      navigate: () => {
        /* dummy function*/
      },
      navigateByUrl: () => {
        /* dummy function*/
      }
    };

    angularFireAuthMock = {
      authState: new Subject<any>(),
      signInWithEmailAndPassword: () => '',
      createUserWithEmailAndPassword: () => '',
      signOut: () => ''
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SessionStore,
          useValue: sessionStoreMock
        },
        {
          provide: SessionQuery,
          useValue: sessionQueryMock
        },
        {
          provide: AngularFireAuth,
          useValue: angularFireAuthMock
        },
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    });

    service = TestBed.inject(AuthService);
    store = TestBed.inject(SessionStore);
    query = TestBed.inject(SessionQuery);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    service.destroy();
  });

  test('should be created', () => {
    service.initialize();

    expect(service).toBeTruthy();
  });

  describe('Listening for the current user', () => {
    test('should set loading when starting up', () => {
      jest.spyOn(store, 'setLoading');

      service.initialize();
      angularFireAuthMock.authState.next(testFirebaseUser);

      expect(store.setLoading).toHaveBeenCalledWith(true);
    });

    test('should login when a new user is emitted by firestore', () => {
      jest.spyOn(store, 'login');

      service.initialize();
      angularFireAuthMock.authState.next(testFirebaseUser);

      expect(store.login).toHaveBeenCalledWith(testUser);
    });

    test('should unset loading after init with a logged in user', () => {
      jest.spyOn(store, 'setLoading');

      service.initialize();
      angularFireAuthMock.authState.next(testFirebaseUser);

      expect(store.setLoading).toHaveBeenLastCalledWith(false);
    });

    test('should redirect to the storedRedirectURL when the user logs in', () => {
      const redirectUrl = 'i-am-batman';
      jest.spyOn(query, 'redirectUrl').mockReturnValue(redirectUrl);
      jest.spyOn(store, 'login');
      const navigateSpy = jest.spyOn(router, 'navigateByUrl');

      service.initialize();
      angularFireAuthMock.authState.next(testFirebaseUser);

      expect(store.login).toHaveBeenCalledWith(testUser);
      expect(router.navigateByUrl).toHaveBeenCalledWith(redirectUrl);

      navigateSpy.mockRestore();
    });

    test('should not redirect to the storedRedirectURL when the user logs out', () => {
      const redirectUrl = 'i-am-batman';
      jest.spyOn(query, 'redirectUrl').mockReturnValue(redirectUrl);
      const navigateSpy = jest.spyOn(router, 'navigateByUrl');

      service.initialize();
      angularFireAuthMock.authState.next(null);

      expect(navigateSpy).not.toHaveBeenCalledWith(redirectUrl);

      navigateSpy.mockRestore();
    });

    test('should logout when the firebase user is not there', () => {
      jest.spyOn(store, 'logout');

      service.initialize();
      angularFireAuthMock.authState.next(null);

      expect(store.logout).toHaveBeenCalled();
    });

    test('should unset loading after init with user that is not logged in', () => {
      jest.spyOn(store, 'setLoading');

      service.initialize();
      angularFireAuthMock.authState.next(testFirebaseUser);

      expect(store.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('signIn', () => {
    const inputEmail = 'test@test.com';
    const inputPassword = 'password';

    let authFire: AngularFireAuth;

    beforeEach(() => {
      authFire = TestBed.inject(AngularFireAuth);
      service.initialize();
    });

    test('should sign in with email and password', async () => {
      jest.spyOn(authFire, 'signInWithEmailAndPassword');

      await service.signIn(inputEmail, inputPassword);

      expect(authFire.signInWithEmailAndPassword).toHaveBeenCalledWith(inputEmail, inputPassword);
    });

    test('should set loading when waiting for authentication', async () => {
      jest.spyOn(authFire, 'signInWithEmailAndPassword');
      jest.spyOn(store, 'setLoading');

      await service.signIn(inputEmail, inputPassword);

      expect(store.setLoading).toHaveReturnedTimes(2);
      expect(store.setLoading).toHaveBeenCalledWith(true);
      expect(store.setLoading).toHaveBeenLastCalledWith(false);
    });

    test('should not set error when authentication is ok', async () => {
      jest.spyOn(authFire, 'signInWithEmailAndPassword').mockReturnValueOnce('' as any);
      jest.spyOn(store, 'setError');

      await service.signIn(inputEmail, inputPassword);

      expect(store.setError).not.toHaveBeenCalled();
    });

    test('should set error when authentication fails', async () => {
      const errorToUse = 'Invalid username/password';
      jest.spyOn(store, 'setError');
      jest.spyOn(authFire, 'signInWithEmailAndPassword').mockRejectedValueOnce({
        message: errorToUse
      });

      await service.signIn(inputEmail, inputPassword);

      expect(store.setError).toHaveBeenCalledWith(errorToUse);
    });

    test('should unset loading when there is an error', async () => {
      const errorToUse = 'Invalid username/password';
      jest.spyOn(store, 'setLoading');
      jest.spyOn(authFire, 'signInWithEmailAndPassword').mockRejectedValue(errorToUse);

      await service.signIn(inputEmail, inputPassword);

      expect(store.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('signUp', () => {
    const inputEmail = 'test@test.com';
    const inputPassword = 'password';

    let authFire: AngularFireAuth;

    beforeEach(() => {
      authFire = TestBed.inject(AngularFireAuth);
      service.initialize();
    });

    test('should sign up with email and password', async () => {
      jest.spyOn(authFire, 'createUserWithEmailAndPassword').mockRejectedValueOnce('');

      await service.signUp(inputEmail, inputPassword);

      expect(authFire.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        inputEmail,
        inputPassword
      );
    });

    test('should set loading when waiting for user creation', async () => {
      jest.spyOn(store, 'setLoading');

      await service.signUp(inputEmail, inputPassword);

      expect(store.setLoading).toHaveBeenCalledTimes(2);
      expect(store.setLoading).toHaveBeenCalledWith(true);
      expect(store.setLoading).toHaveBeenLastCalledWith(false);
    });

    test('should not set error when user creation is ok', async () => {
      jest.spyOn(authFire, 'createUserWithEmailAndPassword').mockReturnValueOnce('' as any);
      jest.spyOn(store, 'setError');

      await service.signUp(inputEmail, inputPassword);

      expect(store.setError).not.toHaveBeenCalled();
    });

    test('should set error when user creation fails', async () => {
      const errorToUse = 'Invalid username/password';
      jest.spyOn(store, 'setError');
      jest.spyOn(authFire, 'createUserWithEmailAndPassword').mockRejectedValue({
        message: errorToUse
      });

      await service.signUp(inputEmail, inputPassword);

      expect(store.setError).toHaveBeenCalledWith(errorToUse);
    });

    test('should unset loading when there is an error', async () => {
      const errorToUse = 'Invalid username/password';
      jest.spyOn(store, 'setLoading');
      jest.spyOn(authFire, 'createUserWithEmailAndPassword').mockRejectedValue(errorToUse);

      await service.signUp(inputEmail, inputPassword);

      expect(store.setLoading).toHaveBeenLastCalledWith(false);
    });
  });

  describe('signOut', () => {
    let authFire: AngularFireAuth;

    beforeEach(() => {
      authFire = TestBed.inject(AngularFireAuth);
      service.initialize();
    });

    test('should sign out', async () => {
      jest.spyOn(authFire, 'signOut');

      await service.signOut();

      expect(angularFireAuthMock.signOut).toHaveBeenCalled();
    });

    test('should navigate to the login route', async () => {
      jest.spyOn(authFire, 'signOut');
      jest.spyOn(router, 'navigate');

      await service.signOut();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
