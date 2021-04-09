import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockComponent } from 'ng-mocks';
import { of, ReplaySubject } from 'rxjs';
import { childComponents, getElementForTest } from '../../../test-utilities/test-functions';
import { testMovies, testMoviesLists } from '../../../test-utilities/test-objects';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { MovieComponent } from '../movie/movie.component';
import { MoviesQuery } from '../movies/state/movies.query';
import { MoviesService } from '../movies/state/movies.service';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';
import { MoviesListDetailsComponent } from './movies-list-details.component';
import { Movie } from '../movies/state/models/movie';
import { MoviesList } from '../state/models/movies-list';
import { RouterTestingModule } from '@angular/router/testing';
import { MovieSearchComponent } from '../movie-search/movie-search.component';
import { SvgIconComponent } from '@ngneat/svg-icon';

describe('MoviesListDetailsComponent', () => {
  let component: MoviesListDetailsComponent;
  let fixture: ComponentFixture<MoviesListDetailsComponent>;

  const listIdToUse = 'dc-movies';

  const allMoviesStream = new ReplaySubject<Movie[]>();
  const editModeStream = new ReplaySubject<{ editMode: boolean }>();
  const loadingStream = new ReplaySubject<boolean>();
  const activeListStream = new ReplaySubject<MoviesList>();

  beforeEach(() => {
    const activatedRouteMock = {
      paramMap: of({
        get: () => listIdToUse
      })
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

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        MoviesListDetailsComponent,
        MockComponent(MovieComponent),
        MockComponent(MovieSearchComponent),
        MockComponent(DialogComponent),
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
          provide: ActivatedRoute,
          useValue: activatedRouteMock
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
      const deleteButton = getElementForTest(fixture, 'deleteButton');

      expect(deleteButton).toBeTruthy();
    });

    test('should ask for confirmation when the delete button is clicked', () => {
      expect(component.showConfirmationDialog).toBeFalsy();
      const deleteButton = getElementForTest(fixture, 'deleteButton');

      deleteButton.triggerEventHandler('click', null);

      expect(component.showConfirmationDialog).toBeTruthy();
    });

    test('should hide the confirmation dialog when the user does not want to delete the list', () => {
      const deleteButton = getElementForTest(fixture, 'deleteButton');
      const noButton = getElementForTest(fixture, 'cancelDeleteButton');

      deleteButton.triggerEventHandler('click', null);
      noButton.triggerEventHandler('click', null);

      expect(component.showConfirmationDialog).toBeFalsy();
    });

    test('should delete the list when the user clicks the confirmation button', () => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      const moviesListToUse = testMoviesLists[0];
      activeListStream.next(moviesListToUse);
      const moviesListsService = TestBed.inject(MoviesListsService);
      jest.spyOn(moviesListsService, 'remove');

      const deleteButton = getElementForTest(fixture, 'deleteButton');
      const yesButton = getElementForTest(fixture, 'confirmDeleteButton');

      deleteButton.triggerEventHandler('click', null);
      yesButton.triggerEventHandler('click', null);

      expect(moviesListsService.remove).toHaveBeenCalledWith(moviesListToUse.id);
      expect(component.showConfirmationDialog).toBeFalsy();
      expect(router.navigate).toHaveBeenCalled();
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
      const doneButton = getElementForTest(fixture, 'doneButton');
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'disableEditMode');

      doneButton.triggerEventHandler('click', null);

      expect(moviesService.disableEditMode).toHaveBeenCalled();
    });
  });

  describe('EditMode is off', () => {
    beforeEach(() => {
      allMoviesStream.next(testMovies);
      editModeStream.next({ editMode: false });

      fixture.detectChanges();
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
      const editButton = getElementForTest(fixture, 'editModeButton');
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'enableEditMode');

      editButton.triggerEventHandler('click', null);

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

    test('should show the search movie component when the user wants to search for a movie', () => {
      loadingStream.next(false);
      fixture.detectChanges();

      const addModeButton = getElementForTest(fixture, 'addModeButton');
      addModeButton.triggerEventHandler('click', null);

      expect(component.addMovieMode).toBe(true);
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
