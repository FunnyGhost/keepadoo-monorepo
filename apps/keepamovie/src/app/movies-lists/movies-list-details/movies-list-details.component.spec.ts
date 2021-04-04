import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MockComponent } from 'ng-mocks';
import { of, ReplaySubject } from 'rxjs';
import { childComponents } from '../../../test-utilities/test-functions';
import { routerMock } from '../../../test-utilities/test-mocks';
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

describe('MoviesListDetailsComponent', () => {
  let component: MoviesListDetailsComponent;
  let fixture: ComponentFixture<MoviesListDetailsComponent>;

  const listIdToUse = 'dc-movies';
  const activatedRouteMock = {
    paramMap: of({
      get: () => listIdToUse
    })
  };

  const moviesListsServiceMock = {
    setActive: () => {
      /*dummy function*/
    },
    remove: () => {
      /*dummy function*/
    }
  };

  const moviesServiceMock = {
    enableEditMode: () => {
      /*dummy function*/
    },
    disableEditMode: () => {
      /*dummy function*/
    },
    deleteMovie: () => {
      /*dummy function*/
    }
  };

  const allMoviesStream = new ReplaySubject<Movie[]>();
  const editModeStream = new ReplaySubject<{ editMode: boolean }>();
  const loadingStream = new ReplaySubject<boolean>();
  const moviesQueryMock = {
    select: () => editModeStream.asObservable(),
    selectAll: () => allMoviesStream.asObservable(),
    selectLoading: () => loadingStream.asObservable()
  };

  const activeListStream = new ReplaySubject<MoviesList>();
  const moviesListsQueryMock = {
    selectActive: () => activeListStream.asObservable()
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          MoviesListDetailsComponent,
          MockComponent(MovieComponent),
          MockComponent(DialogComponent)
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
          },
          {
            provide: Router,
            useValue: routerMock
          }
        ]
      })
        .overrideComponent(MoviesListDetailsComponent, {
          set: { changeDetection: ChangeDetectionStrategy.Default }
        })
        .compileComponents();
    })
  );

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

      const helperText = fixture.debugElement.query(By.css('.helper-text'));
      expect(helperText).toBeFalsy();
    });

    test('should show a helper text if the list has no movies', () => {
      allMoviesStream.next([]);

      fixture.detectChanges();

      const helperText = fixture.debugElement.query(By.css('.helper-text'));
      expect(helperText).toBeTruthy();
    });

    test('should show the selected list title', () => {
      const moviesListToUse = testMoviesLists[0];
      activeListStream.next(moviesListToUse);

      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('h1'));
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
      const editButtons = fixture.debugElement.queryAll(By.css('button.edit-button'));

      expect(editButtons.length).toBe(0);
    });

    test('should show the delete list button', () => {
      const deleteButtons = fixture.debugElement.queryAll(By.css('button.delete-button'));

      expect(deleteButtons.length).toBe(1);
    });

    test('should ask for confirmation when the delete button is clicked', () => {
      expect(component.showConfirmationDialog).toBeFalsy();
      const deleteButton = fixture.debugElement.query(By.css('button.delete-button'));

      deleteButton.triggerEventHandler('click', null);

      expect(component.showConfirmationDialog).toBeTruthy();
    });

    test('should hide the confirmation dialog when the user does not want to delete the list', () => {
      const deleteButton = fixture.debugElement.query(By.css('button.delete-button'));
      const noButton = fixture.debugElement.query(By.css('button.button-no'));

      deleteButton.triggerEventHandler('click', null);
      noButton.triggerEventHandler('click', null);

      expect(component.showConfirmationDialog).toBeFalsy();
    });

    test('should delete the list when the user clicks the confirmation button', () => {
      routerMock.navigate.mockClear();
      const moviesListToUse = testMoviesLists[0];
      activeListStream.next(moviesListToUse);
      const moviesListsService = TestBed.inject(MoviesListsService);
      jest.spyOn(moviesListsService, 'remove');

      const deleteButton = fixture.debugElement.query(By.css('button.delete-button'));
      const yesButton = fixture.debugElement.query(By.css('button.button-yes'));

      deleteButton.triggerEventHandler('click', null);
      yesButton.triggerEventHandler('click', null);

      expect(moviesListsService.remove).toHaveBeenCalledWith(moviesListToUse.id);
      expect(component.showConfirmationDialog).toBeFalsy();
      expect(routerMock.navigate).toHaveBeenCalled();
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
      const doneButton = fixture.debugElement.query(By.css('button.done-button'));
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
      const doneButtons = fixture.debugElement.queryAll(By.css('button.done-button'));

      expect(doneButtons.length).toBe(0);
    });

    test('should enable edit mode when edit button is clicked', () => {
      const editButton = fixture.debugElement.query(By.css('button.edit-button'));
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'enableEditMode');

      editButton.triggerEventHandler('click', null);

      expect(moviesService.enableEditMode).toHaveBeenCalled();
    });
  });

  describe('Back button', () => {
    test('should have a back button', () => {
      const backButton = fixture.debugElement.queryAll(By.css('.back-button'));

      expect(backButton.length).toEqual(1);
    });

    test('should navigate back when the back button is clicked', () => {
      routerMock.navigate.mockClear();
      const backButton = fixture.debugElement.query(By.css('.back-button'));

      backButton.triggerEventHandler('click', null);

      expect(routerMock.navigate).toHaveBeenCalled();
    });
  });

  describe('Destroy', () => {
    test('should disable editing when leaving the movies list details page', () => {
      const moviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'disableEditMode');

      component.ngOnDestroy();

      expect(moviesService.disableEditMode).toHaveBeenCalled();
    });
  });

  describe('Loading', () => {
    test('should show loading when the store is loading', () => {
      loadingStream.next(true);

      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(By.css('.loading-image'));
      expect(loadingElement).toBeTruthy();
    });

    test('should not show loading when the store is not loading', () => {
      loadingStream.next(false);

      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(By.css('.loading-image'));
      expect(loadingElement).toBeFalsy();
    });
  });
});
