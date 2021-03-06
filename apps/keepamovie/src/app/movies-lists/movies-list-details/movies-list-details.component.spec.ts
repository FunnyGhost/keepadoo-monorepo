import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockComponent } from 'ng-mocks';
import { of, ReplaySubject } from 'rxjs';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { MovieComponent } from '../movie/movie.component';
import { MoviesQuery } from '../movies/state/movies.query';
import { MoviesService } from '../movies/state/movies.service';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';
import { MoviesListDetailsComponent } from './movies-list-details.component';
import { Movie } from '../movies/state/models/movie';
import { MoviesList } from '../state/models/movies-list';
import { MovieSearchComponent } from '../movie-search/movie-search.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { ButtonComponent } from '../../shared/button/button.component';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { SlideUpComponent } from '../../shared/slide-up/slide-up.component';
import { testMovies, testMoviesLists } from '../../../test-utilities/test-objects';
import { childComponents, getElementForTest } from '../../../test-utilities/test-functions';

describe('MoviesListDetailsComponent', () => {
  let component: MoviesListDetailsComponent;
  let fixture: ComponentFixture<MoviesListDetailsComponent>;

  const listIdToUse = 'dc-movies';

  const allMoviesStream = new ReplaySubject<Movie[]>();
  const editModeStream = new ReplaySubject<{ editMode: boolean }>();
  const loadingStream = new ReplaySubject<boolean>();
  const activeListStream = new ReplaySubject<MoviesList>();

  beforeEach(() => {
    const routerQueryMock: Partial<RouterQuery> = {
      selectParams: () => of(listIdToUse as any)
    };

    const moviesListsServiceMock: Partial<MoviesListsService> = {
      setActive: () => '',
      remove: () => ''
    };

    const moviesServiceMock = {
      initialize: () => '',
      enableEditMode: () => '',
      disableEditMode: () => '',
      deleteMovie: () => '',
      destroy: () => ''
    };

    const moviesListsQueryMock = {
      selectActive: () => activeListStream.asObservable()
    };

    const moviesQueryMock = {
      select: () => editModeStream.asObservable(),
      selectAll: () => allMoviesStream.asObservable(),
      selectLoading: () => loadingStream.asObservable()
    };

    const routerMock = {
      navigate: () => ''
    };

    TestBed.configureTestingModule({
      declarations: [
        MoviesListDetailsComponent,
        MockComponent(MovieComponent),
        MockComponent(MovieSearchComponent),
        MockComponent(DialogComponent),
        MockComponent(ButtonComponent),
        MockComponent(SlideUpComponent),
        MockComponent(SvgIconComponent)
      ],
      providers: [
        {
          provide: MoviesQuery,
          useValue: moviesQueryMock
        },
        {
          provide: MoviesListsQuery,
          useValue: moviesListsQueryMock
        },
        {
          provide: MoviesService,
          useValue: moviesServiceMock
        },
        {
          provide: MoviesListsService,
          useValue: moviesListsServiceMock
        },
        {
          provide: RouterQuery,
          useValue: routerQueryMock
        },
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    }).overrideComponent(MoviesListDetailsComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoviesListDetailsComponent);
    component = fixture.componentInstance;

    editModeStream.next({ editMode: false });
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should set the active movies list', () => {
    const moviesListsService = TestBed.inject(MoviesListsService);
    jest.spyOn(moviesListsService, 'setActive');

    fixture.detectChanges();

    expect(moviesListsService.setActive).toHaveBeenCalledWith(listIdToUse);
  });

  describe('Render', () => {
    test('should show the helper message if there are no movies in the selected list', () => {
      allMoviesStream.next([]);

      fixture.detectChanges();

      const helperMessage = getElementForTest(fixture, 'noMoviesHelperMessage');
      expect(helperMessage).toBeTruthy();
    });

    test('should not show the helper message if there are movies in the selected list', () => {
      allMoviesStream.next(testMovies);

      fixture.detectChanges();

      const helperMessage = getElementForTest(fixture, 'noMoviesHelperMessage');
      expect(helperMessage).toBeFalsy();
    });

    test('should show the movies in store', () => {
      allMoviesStream.next(testMovies);

      fixture.detectChanges();

      const movieComponents = childComponents<MovieComponent>(fixture, MovieComponent);

      expect(movieComponents.length).toBe(testMovies.length);
      testMovies.forEach((movie) => {
        const element = movieComponents.find(
          (movieComponent) => movieComponent.movie.id === movie.id
        );
        expect(element).toBeTruthy();
      });
    });

    test('should show the selected list title', () => {
      const moviesListToUse = testMoviesLists[0];
      activeListStream.next(moviesListToUse);

      fixture.detectChanges();

      const title = getElementForTest(fixture, 'listName');
      expect(title.nativeElement.textContent.trim()).toBe(moviesListToUse.name);
    });
  });

  describe('EditMode is on', () => {
    beforeEach(() => {
      allMoviesStream.next(testMovies);
      editModeStream.next({ editMode: true });

      fixture.detectChanges();
    });

    test('should show the done button', () => {
      const doneButton = getElementForTest(fixture, 'doneButton')
        .componentInstance as ButtonComponent;

      expect(doneButton.text).toBe('Done');
      expect(doneButton.buttonType).toBe('secondary');
    });

    test('should show the movies in edit mode', () => {
      const movieComponents = childComponents<MovieComponent>(fixture, MovieComponent);

      expect(movieComponents.length).toEqual(testMovies.length);
      movieComponents.forEach((movieComponent) => {
        expect(movieComponent.editMode).toBe(true);
      });
    });

    test('should not show the edit button', () => {
      const editButton = getElementForTest(fixture, 'editModeButton');

      expect(editButton).toBeFalsy();
    });

    test('should show the delete list button', () => {
      const deleteButton = getElementForTest(fixture, 'deleteButton')
        .componentInstance as ButtonComponent;

      expect(deleteButton.buttonType).toBe('warning');
      expect(deleteButton.text).toBe('Delete list');
    });

    test('should ask for confirmation when the delete button is clicked', () => {
      expect(component.showConfirmationDialog).toBeFalsy();
      const deleteButton = getElementForTest(fixture, 'deleteButton')
        .componentInstance as ButtonComponent;
      deleteButton.clicked.emit();

      expect(component.showConfirmationDialog).toBeTruthy();
    });

    test('should hide the confirmation dialog when the user does not want to delete the list', () => {
      const deleteButton = getElementForTest(fixture, 'deleteButton')
        .componentInstance as ButtonComponent;
      const noButton = getElementForTest(fixture, 'cancelDeleteButton')
        .componentInstance as ButtonComponent;

      deleteButton.clicked.emit();
      noButton.clicked.emit();

      expect(component.showConfirmationDialog).toBeFalsy();
    });

    test('should delete the list when the user clicks the confirmation button', () => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      const moviesListToUse = testMoviesLists[0];
      activeListStream.next(moviesListToUse);
      const moviesListsService = TestBed.inject(MoviesListsService);
      jest.spyOn(moviesListsService, 'remove');

      const deleteButton = getElementForTest(fixture, 'deleteButton')
        .componentInstance as ButtonComponent;
      deleteButton.clicked.emit();

      const yesButton = getElementForTest(fixture, 'confirmDeleteButton')
        .componentInstance as ButtonComponent;
      yesButton.clicked.emit();

      expect(moviesListsService.remove).toHaveBeenCalledWith(moviesListToUse.id);
      expect(component.showConfirmationDialog).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['home', 'movies-lists']);
    });

    test('should delete a movie when the delete event is triggered', () => {
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'deleteMovie');
      const movieComponents = childComponents<MovieComponent>(fixture, MovieComponent);
      const movieToDelete = testMovies[0];

      movieComponents[0].delete.emit(movieToDelete);

      expect(moviesService.deleteMovie).toHaveBeenCalledWith(movieToDelete);
    });

    test('should disable edit mode when done button is clicked', () => {
      const doneButton = getElementForTest(fixture, 'doneButton')
        .componentInstance as ButtonComponent;
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'disableEditMode');

      doneButton.clicked.emit();

      expect(moviesService.disableEditMode).toHaveBeenCalled();
    });
  });

  describe('EditMode is off', () => {
    beforeEach(() => {
      allMoviesStream.next(testMovies);
      editModeStream.next({ editMode: false });

      fixture.detectChanges();
    });

    test('should show the edit button', () => {
      const editButton = getElementForTest(fixture, 'editModeButton')
        .componentInstance as ButtonComponent;

      expect(editButton.text).toBe('Edit');
      expect(editButton.buttonType).toBe('secondary');
    });

    test('should not show the movies in edit mode', () => {
      const movieComponents = childComponents<MovieComponent>(fixture, MovieComponent);

      expect(movieComponents.length).toEqual(testMovies.length);
      movieComponents.forEach((movieComponent) => {
        expect(movieComponent.editMode).toBe(false);
      });
    });

    test('should not show the done button', () => {
      const doneButton = getElementForTest(fixture, 'doneButton');

      expect(doneButton).toBeFalsy();
    });

    test('should enable edit mode when edit button is clicked', () => {
      const editButton = getElementForTest(fixture, 'editModeButton')
        .componentInstance as ButtonComponent;
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'enableEditMode');

      editButton.clicked.emit();

      expect(moviesService.enableEditMode).toHaveBeenCalled();
    });
  });

  describe('Destroy', () => {
    test('should disable editing when leaving the movies list details page', () => {
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'disableEditMode');

      component.ngOnDestroy();

      expect(moviesService.disableEditMode).toHaveBeenCalled();
    });

    test('should destroy the movies service when leaving the movies list details page', () => {
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'destroy');

      component.ngOnDestroy();

      expect(moviesService.destroy).toHaveBeenCalled();
    });
  });

  describe('Loading', () => {
    test('should show loading when the store is loading', () => {
      loadingStream.next(true);

      fixture.detectChanges();

      const loadingElement = getElementForTest(fixture, 'loading');
      expect(loadingElement).toBeTruthy();
    });

    test('should not show loading when the store is not loading', () => {
      loadingStream.next(false);

      fixture.detectChanges();

      const loadingElement = getElementForTest(fixture, 'loading');
      expect(loadingElement).toBeFalsy();
    });
  });

  describe('Add movie', () => {
    test('should not show the search movie component by default', () => {
      loadingStream.next(false);
      fixture.detectChanges();

      expect(component.addMovieMode).toBe(false);
    });

    test('should show the add movie button', () => {
      loadingStream.next(false);
      fixture.detectChanges();

      const addButton = getElementForTest(fixture, 'addModeButton')
        .componentInstance as ButtonComponent;

      expect(addButton.text).toBe('Add movie');
      expect(addButton.buttonType).toBe('primary');
      expect(addButton.icon).toBe('search');
    });

    test('should show the search movie component when the user wants to search for a movie', () => {
      loadingStream.next(false);
      fixture.detectChanges();

      const addButton = getElementForTest(fixture, 'addModeButton')
        .componentInstance as ButtonComponent;
      addButton.clicked.emit();

      expect(component.addMovieMode).toBe(true);
    });

    test('should focus the search movie component when the user wants to search for a movie', () => {
      loadingStream.next(false);
      fixture.detectChanges();

      const movieSearchComponent = childComponents<MovieSearchComponent>(
        fixture,
        MovieSearchComponent
      )[0];
      jest.spyOn(movieSearchComponent, 'focusInput');
      const addButton = getElementForTest(fixture, 'addModeButton')
        .componentInstance as ButtonComponent;
      addButton.clicked.emit();

      expect(movieSearchComponent.focusInput).toHaveBeenCalled();
    });

    test('should dismiss the search movie component when the user is done with that', () => {
      loadingStream.next(false);
      fixture.detectChanges();
      component.addMovieMode = true;

      const searchMovieComponent = childComponents(fixture, MovieSearchComponent)[0];
      searchMovieComponent.done.emit();

      fixture.detectChanges();
      expect(component.addMovieMode).toBe(false);
    });
  });
});
