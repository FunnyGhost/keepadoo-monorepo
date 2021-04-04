import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MockComponent } from 'ng-mocks';
import { ReplaySubject } from 'rxjs';
import { testMoviesLists } from '../../../test-utilities/test-objects';
import { MoviesListComponent } from '../movies-list/movies-list.component';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsComponent } from './movies-lists.component';
import { MoviesList } from '../state/models/movies-list';
import { MoviesListsService } from '../state/movies-lists.service';

const moviesListsStream = new ReplaySubject<MoviesList[]>();
const loadingStream = new ReplaySubject<boolean>();
const moviesListsQueryMock: Partial<MoviesListsQuery> = {
  selectAll: () => moviesListsStream.asObservable() as any,
  selectLoading: () => loadingStream.asObservable()
};

const routerMock = {
  navigate: () => {
    /*dummy function*/
  }
};

describe('MoviesListsComponent', () => {
  let component: MoviesListsComponent;
  let fixture: ComponentFixture<MoviesListsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MoviesListsComponent, MockComponent(MoviesListComponent)],
        providers: [
          {
            provide: Router,
            useValue: routerMock
          },
          {
            provide: MoviesListsQuery,
            useValue: moviesListsQueryMock
          },
          {
            provide: MoviesListsService,
            useValue: {}
          }
        ]
      })
        .overrideComponent(MoviesListsComponent, {
          set: { changeDetection: ChangeDetectionStrategy.Default }
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MoviesListsComponent);
    component = fixture.componentInstance;
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should show all lists', () => {
    moviesListsStream.next(testMoviesLists);
    loadingStream.next(false);

    fixture.detectChanges();

    const moviesListsElements = fixture.debugElement.queryAll(By.directive(MoviesListComponent));
    expect(moviesListsElements.length).toBe(testMoviesLists.length);
    const helperText = fixture.debugElement.query(By.css('.helper-text'));
    expect(helperText).toBeFalsy();
  });

  test('should show a helper text if the user has no lists', () => {
    moviesListsStream.next([]);
    loadingStream.next(false);

    fixture.detectChanges();

    const helperText = fixture.debugElement.query(By.css('.helper-text'));

    expect(helperText).toBeTruthy();
  });

  test('should show loading when the store is loading', () => {
    moviesListsStream.next([]);
    loadingStream.next(true);

    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('.loading-image'));

    expect(loadingElement).toBeTruthy();
  });

  test('should not show loading when the store is not loading', () => {
    moviesListsStream.next([]);
    loadingStream.next(false);

    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css('.loading-image'));

    expect(loadingElement).toBeFalsy();
  });

  test('should navigate to the list details', () => {
    moviesListsStream.next(testMoviesLists);
    loadingStream.next(false);
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');

    fixture.detectChanges();

    const listId = testMoviesLists[0].id;
    const moviesListsElements = fixture.debugElement
      .queryAll(By.directive(MoviesListComponent))
      .map((el) => el.componentInstance);
    (moviesListsElements[0] as MoviesListComponent).listClick.emit(listId);

    expect(router.navigate).toHaveBeenCalledWith([`/home/movies-lists/${listId}`]);
  });
});
