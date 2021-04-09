import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockComponent } from 'ng-mocks';
import { ReplaySubject } from 'rxjs';
import { testMoviesLists } from '@test-utilities/test-objects';
import { MoviesListComponent } from '../movies-list/movies-list.component';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsComponent } from './movies-lists.component';
import { MoviesList } from '../state/models/movies-list';
import { MoviesListsService } from '../state/movies-lists.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MoviesListCreateComponent } from '../movies-list-create/movies-list-create.component';
import { childComponents, getElementForTest } from '@test-utilities/test-functions';
import { SvgIconComponent } from '@ngneat/svg-icon';

const moviesListsStream = new ReplaySubject<MoviesList[]>();
const loadingStream = new ReplaySubject<boolean>();

describe('MoviesListsComponent', () => {
  let component: MoviesListsComponent;
  let fixture: ComponentFixture<MoviesListsComponent>;

  beforeEach(() => {
    const moviesListsQueryMock: Partial<MoviesListsQuery> = {
      selectAll: () => moviesListsStream.asObservable() as any,
      selectLoading: () => loadingStream.asObservable()
    };

    const moviesListsServiceMock: Partial<MoviesListsService> = {
      initialize: () => '',
      destroy: () => ''
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        MoviesListsComponent,
        MockComponent(MoviesListComponent),
        MockComponent(MoviesListCreateComponent),
        MockComponent(SvgIconComponent)
      ],
      providers: [
        {
          provide: MoviesListsQuery,
          useValue: moviesListsQueryMock
        },
        {
          provide: MoviesListsService,
          useValue: moviesListsServiceMock
        }
      ]
    }).overrideComponent(MoviesListsComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });
  });

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

    const moviesListsElements = childComponents(fixture, MoviesListComponent);
    expect(moviesListsElements.length).toBe(testMoviesLists.length);
  });

  test('should show the list content', () => {
    fixture.detectChanges();

    const listContent = getElementForTest(fixture, 'listContent');

    expect(listContent).toBeTruthy();
  });

  test('should show loading when the store is loading', () => {
    moviesListsStream.next([]);
    loadingStream.next(true);

    fixture.detectChanges();

    const loadingElement = getElementForTest(fixture, 'loading');

    expect(loadingElement).toBeTruthy();
  });

  test('should not show loading when the store is not loading', () => {
    moviesListsStream.next([]);
    loadingStream.next(false);

    fixture.detectChanges();

    const loadingElement = getElementForTest(fixture, 'loading');

    expect(loadingElement).toBeFalsy();
  });

  test('should navigate to the list details', () => {
    moviesListsStream.next(testMoviesLists);
    loadingStream.next(false);
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockReturnValueOnce('' as any);

    fixture.detectChanges();

    const listId = testMoviesLists[0].id;
    const moviesListsElements = childComponents(fixture, MoviesListComponent);
    moviesListsElements[0].listClick.emit(listId);

    expect(router.navigate).toHaveBeenCalledWith([`/home/movies-lists/${listId}`]);
  });

  describe('Create new list', () => {
    test('should not show the create list component by default', () => {
      moviesListsStream.next(testMoviesLists);
      loadingStream.next(false);
      fixture.detectChanges();

      expect(component.createListMode).toBe(false);
    });

    test('should show the create new list component when the user wants to create a new list', () => {
      moviesListsStream.next(testMoviesLists);
      loadingStream.next(false);
      fixture.detectChanges();

      const newListButton = getElementForTest(fixture, 'createButton');
      newListButton.triggerEventHandler('click', null);

      expect(component.createListMode).toBe(true);
    });

    test('should dismiss the create list component when the user is done with that', () => {
      moviesListsStream.next(testMoviesLists);
      loadingStream.next(false);
      fixture.detectChanges();
      component.createListMode = true;

      const createListComponent = childComponents(fixture, MoviesListCreateComponent)[0];
      createListComponent.done.emit();

      fixture.detectChanges();
      expect(component.createListMode).toBe(false);
    });
  });
});
