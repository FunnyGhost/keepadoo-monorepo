import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, ReplaySubject } from 'rxjs';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';
import { MoviesListCreateComponent } from './movies-list-create.component';
import { MockComponent } from 'ng-mocks';
import { ButtonComponent } from '../../shared/button/button.component';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { childComponents, getElementForTest } from '../../../test-utilities/test-functions';

const errorStream = new ReplaySubject<string>(1);
const loadingStream = new ReplaySubject<boolean>(1);

describe('MoviesListCreateComponent', () => {
  let component: MoviesListCreateComponent;
  let fixture: ComponentFixture<MoviesListCreateComponent>;
  let moviesListService: MoviesListsService;

  beforeEach(() => {
    const queryMock = {
      selectError: () => errorStream.asObservable(),
      selectLoading: () => loadingStream.asObservable()
    };

    const moviesListsServiceMock = {
      add: () => of()
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        MoviesListCreateComponent,
        MockComponent(ButtonComponent),
        MockComponent(SvgIconComponent)
      ],
      providers: [
        {
          provide: MoviesListsService,
          useValue: moviesListsServiceMock
        },
        {
          provide: MoviesListsQuery,
          useValue: queryMock
        }
      ]
    }).overrideComponent(MoviesListCreateComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoviesListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    moviesListService = TestBed.inject(MoviesListsService);
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should show the create button', () => {
    const createButton = childComponents<ButtonComponent>(fixture, ButtonComponent)[0];

    expect(createButton.text).toBe('Create');
    expect(createButton.buttonType).toBe('primary');
  });

  test('should create the movies list', () => {
    const listNameToUse = 'batman stuff';
    const nameInput = getElementForTest(fixture, 'nameInput');
    const createButton = childComponents<ButtonComponent>(fixture, ButtonComponent)[0];
    jest.spyOn(moviesListService, 'add');

    nameInput.nativeElement.value = listNameToUse;
    nameInput.nativeElement.dispatchEvent(new Event('input'));

    createButton.clicked.emit();

    expect(moviesListService.add).toHaveBeenCalledWith({
      name: listNameToUse
    });
  });

  describe('focusInput', () => {
    test('should focus the input with a 500ms delay', fakeAsync(() => {
      const focusSpy = jest.spyOn(component.inputElement.nativeElement, 'focus');

      component.focusInput();
      expect(focusSpy).not.toHaveBeenCalled();

      tick(500);
      expect(focusSpy).toHaveBeenCalled();
    }));
  });

  describe('CreateButton', () => {
    test('should be enabled if the form is valid', () => {
      const listName = component.moviesListForm.controls['name'];
      listName.setValue('batman stuff');

      fixture.detectChanges();
      const createButton = childComponents<ButtonComponent>(fixture, ButtonComponent)[0];

      expect(createButton.disabled).toBe(false);
    });

    test('should be disabled if the form is invalid', () => {
      const listName = component.moviesListForm.controls['name'];
      listName.setValue('');

      fixture.detectChanges();
      const createButton = childComponents<ButtonComponent>(fixture, ButtonComponent)[0];

      expect(createButton.disabled).toBe(true);
    });
  });

  describe('Error', () => {
    test('should not be visible if there is no error', () => {
      errorStream.next(null);

      const errorElement = getElementForTest(fixture, 'error');

      expect(errorElement).toBeFalsy();
    });

    test('should be visible if there is an error', () => {
      const errorToUse = 'Invalid username/password';
      errorStream.next(errorToUse);
      fixture.detectChanges();

      const errorElement = getElementForTest(fixture, 'error');

      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.innerHTML).toContain(errorToUse);
    });
  });
});
