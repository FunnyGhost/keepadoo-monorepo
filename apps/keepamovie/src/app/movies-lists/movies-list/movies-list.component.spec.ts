import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testMoviesLists } from '../../../test-utilities/test-objects';
import { Movie } from '../movies/state/models/movie';
import { MoviesListComponent } from './movies-list.component';
import { getElementForTest, getElementsForTest } from '../../../test-utilities/test-functions';

describe('MoviesListComponent', () => {
  const listToUse = testMoviesLists[1];
  let component: MoviesListComponent;
  let fixture: ComponentFixture<MoviesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoviesListComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoviesListComponent);
    component = fixture.componentInstance;
    component.moviesList = listToUse;

    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Render', () => {
    test('should show the list name', () => {
      const titleElement = getElementForTest(fixture, 'listName');

      expect(titleElement.nativeElement.innerHTML).toBe(listToUse.name);
    });

    test('should show the list size', () => {
      const sizeElement = getElementForTest(fixture, 'listCount');

      expect(sizeElement.nativeElement.innerHTML).toContain(listToUse.moviesCount.toString());
    });

    test('should show the last movies in list', () => {
      const imgTags = getElementsForTest(fixture, 'movieImage');

      expect(imgTags.length).toBe(listToUse.recentMovies.length);
      listToUse.recentMovies.forEach((movie: Movie, index: number) => {
        expect(imgTags[index].nativeElement.src).toContain(movie.poster_path);
      });
    });
  });

  test('should emit when the list is clicked', () => {
    const selectButton = getElementForTest(fixture, 'selectButton');
    let selectedList = '';
    component.listClick.subscribe((listId) => (selectedList = listId));

    selectButton.triggerEventHandler('click', null);

    expect(selectedList).toEqual(listToUse.id);
  });
});
