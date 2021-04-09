import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testMovies } from '@test-utilities/test-objects';
import { MovieComponent } from './movie.component';
import { childComponents, getElementForTest } from '@test-utilities/test-functions';
import { MockComponent } from 'ng-mocks';
import { RatingComponent } from '../../shared/rating/rating/rating.component';
import { SvgIconComponent } from '@ngneat/svg-icon';

describe('MovieComponent', () => {
  const movieToUse = testMovies[0];
  let component: MovieComponent;
  let fixture: ComponentFixture<MovieComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MovieComponent,
        MockComponent(RatingComponent),
        MockComponent(SvgIconComponent)
      ]
    }).overrideComponent(MovieComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieComponent);
    component = fixture.componentInstance;
    component.movie = movieToUse;
  });

  test('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('Render', () => {
    test('should show the movie poster', () => {
      fixture.detectChanges();
      const moviePoster = getElementForTest(fixture, 'moviePoster');

      expect(moviePoster.nativeElement.src).toContain(movieToUse.poster_path);
    });

    test('should show the movie title', () => {
      fixture.detectChanges();
      const movieTitle = getElementForTest(fixture, 'movieTitle');

      expect(movieTitle.nativeElement.textContent).toContain(movieToUse.title);
    });

    test('should show the movie release year', () => {
      fixture.detectChanges();
      const movieReleaseDate = getElementForTest(fixture, 'movieReleaseDate');

      expect(movieReleaseDate.nativeElement.textContent).toContain(
        movieToUse.release_date.getFullYear()
      );
    });

    test('should show the movie rating', () => {
      fixture.detectChanges();
      const movieRating = childComponents<RatingComponent>(fixture, RatingComponent)[0];

      expect(movieRating.rating).toEqual(movieToUse.vote_average);
    });
  });

  describe('Edit mode enabled', () => {
    beforeEach(() => {
      component.editMode = true;
      fixture.detectChanges();
    });

    test('should have a delete button', () => {
      const deleteButton = getElementForTest(fixture, 'deleteButton');

      expect(deleteButton).toBeTruthy();
    });

    test('should emit the delete event when the delete button is clicked', () => {
      const deleteButton = getElementForTest(fixture, 'deleteButton');
      let movieToDelete;
      component.delete.subscribe((data) => (movieToDelete = data));

      deleteButton.triggerEventHandler('click', null);

      expect(movieToDelete).toEqual(component.movie);
    });
  });

  describe('Edit mode disabled', () => {
    beforeEach(() => {
      component.editMode = false;
      fixture.detectChanges();
    });

    test('should not have a delete button', () => {
      const deleteButton = getElementForTest(fixture, 'deleteButton');

      expect(deleteButton).toBeFalsy();
    });
  });
});
