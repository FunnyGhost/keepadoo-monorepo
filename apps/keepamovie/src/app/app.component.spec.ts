import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AuthService } from './state/auth.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            initialize: () => {
              /* dummy function */
            },
            destroy: () => {
              /* dummy function */
            }
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
  });

  test('should create the app', () => {
    fixture.detectChanges();

    expect(app).toBeTruthy();
  });

  test('should setup the authentication', () => {
    const authService = TestBed.inject(AuthService);
    jest.spyOn(authService, 'initialize');

    fixture.detectChanges();

    expect(authService.initialize).toHaveBeenCalled();
  });

  test('should destroy the authService on destroy', () => {
    const authService = TestBed.inject(AuthService);
    jest.spyOn(authService, 'destroy');

    fixture.detectChanges();
    app.ngOnDestroy();

    expect(authService.destroy).toHaveBeenCalled();
  });
});
