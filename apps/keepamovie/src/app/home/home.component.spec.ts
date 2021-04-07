import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../state/auth.service';
import { HomeComponent } from './home.component';
import { getElementForTest } from '../../test-utilities/test-functions';
import { SessionQuery } from '../state/session.query';
import { ReplaySubject } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const loggedInStream = new ReplaySubject<boolean>(1);
  const sessionQueryMock: Partial<SessionQuery> = {
    isLoggedIn$: loggedInStream.asObservable()
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: { signOut: () => '' }
        },
        {
          provide: SessionQuery,
          useValue: sessionQueryMock
        }
      ],
      declarations: [HomeComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    loggedInStream.next(true);
  });

  test('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should have a logo', () => {
    fixture.detectChanges();
    const logo = getElementForTest(fixture, 'logo');

    expect(logo).toBeTruthy();
  });

  test('should have content', () => {
    fixture.detectChanges();
    const content = getElementForTest(fixture, 'content');

    expect(content).toBeTruthy();
  });

  describe('LoggedIn', () => {
    beforeEach(() => {
      loggedInStream.next(true);
    });

    test('should show the logout button', () => {
      fixture.detectChanges();
      const logoutButton = getElementForTest(fixture, 'logoutButton');

      expect(logoutButton).toBeTruthy();
    });

    test('should logout the user when the logout button is clicked', () => {
      const authService = TestBed.inject(AuthService);
      jest.spyOn(authService, 'signOut');
      fixture.detectChanges();
      const logoutButton = getElementForTest(fixture, 'logoutButton');

      logoutButton.triggerEventHandler('click', null);

      expect(authService.signOut).toHaveBeenCalled();
    });
  });

  describe('LoggedOut', () => {
    beforeEach(() => {
      loggedInStream.next(false);
    });

    test('should not show the logout button', () => {
      fixture.detectChanges();
      const logoutButton = getElementForTest(fixture, 'logoutButton');

      expect(logoutButton).toBeFalsy();
    });
  });
});
