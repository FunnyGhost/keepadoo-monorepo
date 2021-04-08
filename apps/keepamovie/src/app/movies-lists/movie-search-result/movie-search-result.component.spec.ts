import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testMovieSearchResults } from '../../../test-utilities/test-objects';
import { MovieSearchResultComponent } from './movie-search-result.component';
import { getElementForTest } from '../../../test-utilities/test-functions';

const movieSearchResultToUse = testMovieSearchResults[0];

describe('MovieSearchResultComponent', () => {
  let component: MovieSearchResultComponent;
  let fixture: ComponentFixture<MovieSearchResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MovieSearchResultComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieSearchResultComponent);
    component = fixture.componentInstance;
    component.movie = movieSearchResultToUse;

    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Render', () => {
    test('should show the movie poster', () => {
      const moviePoster = getElementForTest(fixture, 'moviePoster');

      expect(moviePoster).toBeTruthy();
      expect(moviePoster.nativeElement.src).toContain(movieSearchResultToUse.poster_path);
    });
  });

  test('should emit when the user wants to add the movie to the list', () => {
    const moviePoster = getElementForTest(fixture, 'moviePoster');
    let movieToAdd;
    component.movieAddedToList.subscribe((data) => (movieToAdd = data));

    moviePoster.triggerEventHandler('click', null);

    expect(movieToAdd).toEqual(movieSearchResultToUse);
  });
});
