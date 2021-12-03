import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../state/auth.service';
import { SessionQuery } from '../state/session.query';
import { RegisterComponent } from './register.component';
import { RouterLinkWithHref } from '@angular/router';
import { MockComponent } from 'ng-mocks';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { ButtonComponent } from '../shared/button/button.component';
import {
  childComponents,
  getElementForTest,
  getElementsForTest
} from '../../test-utilities/test-functions';

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
  signUp: () => new Promise<void>(() => '')
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        RegisterComponent,
        MockComponent(RouterLinkWithHref),
        MockComponent(SvgIconComponent),
        MockComponent(ButtonComponent)
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
    }).overrideComponent(RegisterComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  test('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should register the user', () => {
    jest.spyOn(authService, 'signUp');
    fixture.detectChanges();

    const emailToUse = 'batman@gotham.dc';
    const passwordToUse = 'HahahHahAHha';
    const emailInput = getElementForTest(fixture, 'emailInput');
    const passwordInput = getElementForTest(fixture, 'passwordInput');
    const registerButton = childComponents<ButtonComponent>(fixture, ButtonComponent)[0];

    emailInput.nativeElement.value = emailToUse;
    emailInput.nativeElement.dispatchEvent(new Event('input'));
    passwordInput.nativeElement.value = passwordToUse;
    passwordInput.nativeElement.dispatchEvent(new Event('input'));

    registerButton.clicked.emit();

    expect(authService.signUp).toHaveBeenCalledWith(emailToUse, passwordToUse);
  });

  describe('RegisterButton', () => {
    test('should show the register button', () => {
      fixture.detectChanges();
      const registerButton = childComponents<ButtonComponent>(fixture, ButtonComponent)[0];

      expect(registerButton.text).toBe('Register');
      expect(registerButton.buttonType).toBe('primary');
    });

    test('should be enabled if the form is valid', () => {
      const email = component.registerForm.controls['email'];
      email.setValue('batman@gotham.dc');
      const password = component.registerForm.controls['password'];
      password.setValue('Hahahahhaahah');

      fixture.detectChanges();
      const registerButton = childComponents<ButtonComponent>(fixture, ButtonComponent)[0];

      expect(registerButton.disabled).toBe(false);
    });

    test('should be disabled if the form is invalid', () => {
      const email = component.registerForm.controls['email'];
      email.setValue('');

      fixture.detectChanges();
      const registerButton = childComponents<ButtonComponent>(fixture, ButtonComponent)[0];

      expect(registerButton.disabled).toBe(true);
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
        const loadingImage = getElementsForTest(fixture, 'loading');

        expect(loadingImage.length).toBe(0);
      });
    });

    describe('isLoading', () => {
      beforeEach(() => {
        queryMock.loading.next(true);
        fixture.detectChanges();
      });

      test('should show the loading overlay', () => {
        const loadingImage = getElementsForTest(fixture, 'loading');

        expect(loadingImage.length).toBe(1);
      });
    });
  });

  test('should have a button to go to the login page', () => {
    const loginLink = getElementForTest(fixture, 'loginLink')
      .componentInstance as RouterLinkWithHref;

    expect(loginLink.routerLink).toContain('login');
  });
});
