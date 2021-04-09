import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, ReplaySubject } from 'rxjs';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';
import { MoviesListCreateComponent } from './movies-list-create.component';
import { getElementForTest } from '../../../test-utilities/test-functions';
import { MockComponent } from 'ng-mocks';
import { SvgIconComponent } from '@ngneat/svg-icon';

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
      declarations: [MoviesListCreateComponent, MockComponent(SvgIconComponent)],
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

  test('should create the movies list', () => {
    const listNameToUse = 'batman stuff';
    const nameInput = getElementForTest(fixture, 'nameInput');
    const createButton = getElementForTest(fixture, 'createButton');
    jest.spyOn(moviesListService, 'add');

    nameInput.nativeElement.value = listNameToUse;
    nameInput.nativeElement.dispatchEvent(new Event('input'));

    createButton.triggerEventHandler('click', null);

    expect(moviesListService.add).toHaveBeenCalledWith({
      name: listNameToUse
    });
  });

  describe('CreateButton', () => {
    test('should be enabled if the form is valid', () => {
      const listName = component.moviesListForm.controls['name'];
      listName.setValue('batman stuff');

      fixture.detectChanges();
      const createButton = getElementForTest(fixture, 'createButton');

      expect(createButton.nativeElement.disabled).toBeFalsy();
    });

    test('should be disabled if the form is invalid', () => {
      const listName = component.moviesListForm.controls['name'];
      listName.setValue('');

      fixture.detectChanges();
      const createButton = getElementForTest(fixture, 'createButton');

      expect(createButton.nativeElement.disabled).toBeTruthy();
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
