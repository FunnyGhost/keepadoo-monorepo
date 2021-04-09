import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';
import { ReplaySubject } from 'rxjs';
import { testMovieSearchResults } from '../../../test-utilities/test-objects';
import { MovieSearchResultComponent } from '../movie-search-result/movie-search-result.component';
import { MoviesListsService } from '../state/movies-lists.service';
import { MovieSearchComponent } from './movie-search.component';
import { MovieSearchQuery } from './state/movie-search.query';
import { MovieSearchService } from './state/movie-search.service';
import { MovieSearchResult } from './state/models/movie-search-results';
import { childComponents, getElementForTest } from '../../../test-utilities/test-functions';
import { SvgIconComponent } from '@ngneat/svg-icon';

describe('MovieSearchComponent', () => {
  let component: MovieSearchComponent;
  let fixture: ComponentFixture<MovieSearchComponent>;

  const allMoviesStream = new ReplaySubject<MovieSearchResult[]>(1);

  beforeEach(() => {
    const movieSearchMock: Partial<MovieSearchService> = {
      initialize: () => '',
      searchMovies: () => '',
      clearSearchResults: () => '',
      destroy: () => ''
    };

    const movieListServiceMock: Partial<MoviesListsService> = {
      addMovieToCurrentList: () => ''
    };

    const movieSearchQueryMock: Partial<MovieSearchQuery> = {
      selectAll: () => allMoviesStream.asObservable() as any
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [
        MovieSearchComponent,
        MockComponent(MovieSearchResultComponent),
        MockComponent(SvgIconComponent)
      ],
      providers: [
        { provide: MovieSearchService, useValue: movieSearchMock },
        { provide: MoviesListsService, useValue: movieListServiceMock },
        {
          provide: MovieSearchQuery,
          useValue: movieSearchQueryMock
        }
      ]
    }).overrideComponent(MovieSearchComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieSearchComponent);
    component = fixture.componentInstance;
  });

  test('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should initialize the search service', () => {
    const movieSearchService = TestBed.inject(MovieSearchService);
    jest.spyOn(movieSearchService, 'initialize');
    fixture.detectChanges();

    expect(movieSearchService.initialize).toHaveBeenCalled();
  });

  test('should wait 500ms when a user types something and then search', fakeAsync(() => {
    fixture.detectChanges();
    const movieToSearchFor = 'Batman';
    const movieSearchService = TestBed.inject(MovieSearchService);
    jest.spyOn(movieSearchService, 'searchMovies');

    const searchInput = getElementForTest(fixture, 'searchInput');
    expect(searchInput).toBeTruthy();

    searchInput.nativeElement.value = movieToSearchFor;
    searchInput.nativeElement.dispatchEvent(new Event('input'));

    expect(movieSearchService.searchMovies).not.toHaveBeenCalledWith(movieToSearchFor);

    tick(500);

    expect(movieSearchService.searchMovies).toHaveBeenCalledWith(movieToSearchFor);
  }));

  test('should display the movies from the search store', () => {
    allMoviesStream.next(testMovieSearchResults);

    fixture.detectChanges();

    const movieElements = childComponents(fixture, MovieSearchResultComponent);
    expect(movieElements.length).toBe(testMovieSearchResults.length);
  });

  test('should add a movie to the list when selected', () => {
    const movieListService = TestBed.inject(MoviesListsService);
    jest.spyOn(movieListService, 'addMovieToCurrentList');
    allMoviesStream.next(testMovieSearchResults);

    fixture.detectChanges();

    const movieElement = childComponents(fixture, MovieSearchResultComponent)[0];
    movieElement.movieAddedToList.emit(testMovieSearchResults[0]);

    expect(movieListService.addMovieToCurrentList).toHaveBeenCalledWith(testMovieSearchResults[0]);
  });

  test('should emit done when a movie is added', () => {
    let doneCalled = false;
    component.done.subscribe(() => (doneCalled = true));
    allMoviesStream.next(testMovieSearchResults);

    fixture.detectChanges();

    const movieElement = childComponents(fixture, MovieSearchResultComponent)[0];
    movieElement.movieAddedToList.emit(testMovieSearchResults[0]);

    expect(doneCalled).toBe(true);
  });

  test('should emit done when the cancel button is hit', () => {
    let doneCalled = false;
    component.done.subscribe(() => (doneCalled = true));
    const closeButton = getElementForTest(fixture, 'closeButton');

    closeButton.triggerEventHandler('click', null);

    expect(doneCalled).toBe(true);
  });

  test('should destroy the search service', () => {
    const movieSearchService = TestBed.inject(MovieSearchService);
    jest.spyOn(movieSearchService, 'destroy');
    fixture.detectChanges();

    component.ngOnDestroy();

    expect(movieSearchService.destroy).toHaveBeenCalled();
  });
});
