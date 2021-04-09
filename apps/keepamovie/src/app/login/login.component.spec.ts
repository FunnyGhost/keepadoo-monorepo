import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../state/auth.service';
import { SessionQuery } from '../state/session.query';
import { LoginComponent } from './login.component';
import { MockComponent } from 'ng-mocks';
import { RouterLinkWithHref } from '@angular/router';
import { getElementForTest, getElementsForTest } from '@test-utilities/test-functions';
import { SvgIconComponent } from '@ngneat/svg-icon';

const queryMock = {
  error: new BehaviorSubject<string | null>(null),
  selectError(): Observable<string | null> {
    return this.error.asObservable();
  },
  loading: new BehaviorSubject<boolean>(false),
  selectLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }
};

const authServiceMock: Partial<AuthService> = {
  signIn: () => new Promise<void>(() => '')
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        LoginComponent,
        MockComponent(RouterLinkWithHref),
        MockComponent(SvgIconComponent)
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: SessionQuery,
          useValue: queryMock
        }
      ]
    }).overrideComponent(LoginComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  test('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should login the user', () => {
    jest.spyOn(authService, 'signIn');
    fixture.detectChanges();

    const emailToUse = 'batman@gotham.dc';
    const passwordToUse = 'HahahHahAHha';
    const emailInput = getElementForTest(fixture, 'emailInput');
    const passwordInput = getElementForTest(fixture, 'passwordInput');
    const loginButton = getElementForTest(fixture, 'submitButton');

    emailInput.nativeElement.value = emailToUse;
    emailInput.nativeElement.dispatchEvent(new Event('input'));
    passwordInput.nativeElement.value = passwordToUse;
    passwordInput.nativeElement.dispatchEvent(new Event('input'));

    loginButton.triggerEventHandler('click', null);

    expect(authService.signIn).toHaveBeenCalledWith(emailToUse, passwordToUse);
  });

  describe('LoginButton', () => {
    test('should be enabled if the form is valid', () => {
      const email = component.loginForm.controls['email'];
      email.setValue('batman@gotham.dc');
      const password = component.loginForm.controls['password'];
      password.setValue('Hahahahhaahah');

      fixture.detectChanges();
      const loginButton = getElementForTest(fixture, 'submitButton');

      expect(loginButton.nativeElement.disabled).toBeFalsy();
    });

    test('should be disabled if the form is invalid', () => {
      const email = component.loginForm.controls['email'];
      email.setValue('');

      fixture.detectChanges();
      const loginButton = getElementForTest(fixture, 'submitButton');

      expect(loginButton.nativeElement.disabled).toBeTruthy();
    });
  });

  describe('Error', () => {
    test('should not be visible if there is no error', () => {
      queryMock.error.next(null);
      fixture.detectChanges();

      const errorElements = getElementsForTest(fixture, 'error');

      expect(errorElements.length).toBe(0);
    });

    test('should be visible if there is an error', () => {
      const errorToUse = 'Invalid username/password';
      queryMock.error.next(errorToUse);
      fixture.detectChanges();

      const errorElements = getElementsForTest(fixture, 'error');

      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.innerHTML).toContain(errorToUse);
    });
  });

  describe('Loading', () => {
    describe('isNotLoading', () => {
      beforeEach(() => {
        queryMock.loading.next(false);
        fixture.detectChanges();
      });

      test('should not show the loading overlay', () => {
        const loadingOverlay = getElementsForTest(fixture, 'loading');
        expect(loadingOverlay.length).toBe(0);
      });
    });

    describe('isLoading', () => {
      beforeEach(() => {
        queryMock.loading.next(true);
        fixture.detectChanges();
      });

      test('should show the loading overlay', () => {
        const loadingOverlay = getElementsForTest(fixture, 'loading');
        expect(loadingOverlay.length).toBe(1);
      });
    });
  });

  test('should have a button to go to the register page', () => {
    const registerButton = getElementForTest(fixture, 'registerLink')
      .componentInstance as RouterLinkWithHref;

    expect(registerButton.routerLink).toContain('register');
  });
});
