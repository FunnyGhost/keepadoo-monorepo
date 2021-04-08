import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { of, ReplaySubject } from 'rxjs';
import {
  testMovies,
  testMovieSearchResults,
  testMoviesLists,
  testUser
} from '../../../../test-utilities/test-objects';
import { SessionQuery } from '../../../state/session.query';
import { MoviesList } from '../../state/models/movies-list';
import { MoviesListsQuery } from '../../state/movies-lists.query';
import { Movie } from './models/movie';
import { MoviesService } from './movies.service';
import { MoviesStore } from './movies.store';
import { HotToastService } from '@ngneat/hot-toast';

const firestoreMock = {
  collection() {
    /*dummy function*/
  }
};

const addSpy = jest.fn();
const deleteSpy = jest.fn();

const deleteMovieInListSpy = jest.fn().mockReturnValue(of());
const firestoreMockSpy = jest.spyOn(firestoreMock, 'collection').mockReturnValue({
  valueChanges() {
    {
      return of(testMovies);
    }
  },
  snapshotChanges() {
    {
      return of([
        {
          payload: {
            doc: {
              ref: {
                delete: deleteMovieInListSpy
              }
            }
          }
        }
      ]);
    }
  },
  add: addSpy,
  doc() {
    return {
      delete: deleteSpy
    };
  }
} as any);

const userIdStream = new ReplaySubject<string>(1);
const activeListStream = new ReplaySubject<MoviesList>(1);

describe('MoviesService', () => {
  let service: MoviesService;
  let moviesStore: MoviesStore;
  let notificationService: HotToastService;

  beforeEach(() => {
    const sessionQueryMock = {
      userId: () => testUser.userId,
      userId$: userIdStream.asObservable()
    };

    const moviesListsQueryMock = {
      selectActive: () => activeListStream.asObservable()
    };

    const notificationServiceMock = {
      error: () => '',
      success: () => ''
    };

    const moviesStoreMock: Partial<MoviesStore> = {
      set: () => '',
      remove: () => '',
      update: () => '',
      setLoading: () => ''
    };
    TestBed.configureTestingModule({
      providers: [
        MoviesService,
        {
          provide: AngularFirestore,
          useValue: firestoreMock
        },
        {
          provide: SessionQuery,
          useValue: sessionQueryMock
        },
        {
          provide: MoviesListsQuery,
          useValue: moviesListsQueryMock
        },
        {
          provide: MoviesStore,
          useValue: moviesStoreMock
        },
        {
          provide: HotToastService,
          useValue: notificationServiceMock
        }
      ]
    });

    addSpy.mockClear();
    deleteSpy.mockClear();
    firestoreMockSpy.mockClear();

    service = TestBed.inject(MoviesService);
    moviesStore = TestBed.inject(MoviesStore);
    notificationService = TestBed.inject(HotToastService);
  });

  afterEach(() => {
    service.destroy();
  });

  test('should be created', () => {
    service.initialize();

    expect(service).toBeTruthy();
  });

  describe('Listen to the selected list', () => {
    describe('User is logged in', () => {
      beforeEach(() => {
        userIdStream.next(testUser.userId);
        jest.spyOn(service, 'getMoviesInList').mockReturnValueOnce(of(testMovies));
      });

      test('should populate the store with the movies in the currently selected list', () => {
        jest.spyOn(moviesStore, 'set');
        activeListStream.next(testMoviesLists[0]);

        service.initialize();

        expect(moviesStore.set).toHaveBeenCalledWith(testMovies);
      });

      test('should correctly handle the loading state', () => {
        jest.spyOn(moviesStore, 'setLoading');
        activeListStream.next(testMoviesLists[0]);

        service.initialize();

        expect(moviesStore.setLoading).toHaveBeenCalledTimes(2);
        expect(moviesStore.setLoading).toHaveBeenCalledWith(true);
        expect(moviesStore.setLoading).toHaveBeenLastCalledWith(false);
      });

      test('should clear the store if there is no selected list', () => {
        jest.spyOn(moviesStore, 'set');
        activeListStream.next(undefined);

        service.initialize();

        expect(moviesStore.set).toHaveBeenCalledWith([]);
      });
    });

    describe('User is not logged in', () => {
      test('should clear the store', () => {
        jest.spyOn(moviesStore, 'set');
        userIdStream.next('');
        activeListStream.next(testMoviesLists[0]);

        service.initialize();

        expect(moviesStore.set).toHaveBeenCalledWith([]);
      });
    });
  });

  describe('getMoviesInList', () => {
    test('should get movies in list', () => {
      let movies: Movie[];

      service.initialize();
      service.getMoviesInList('1').subscribe((data: Movie[]) => (movies = data));

      expect(movies).toEqual(testMovies);
    });
  });

  describe('addMovieToList', () => {
    test('should add the movie to the list', () => {
      const listId = '123';
      const movieToAdd = testMovieSearchResults[0];
      addSpy.mockReturnValueOnce(of({}));

      service.initialize();
      service.addMovieToList(listId, movieToAdd).subscribe();

      expect(addSpy).toHaveBeenCalledWith({
        ...movieToAdd,
        listId,
        added_on: expect.any(String)
      });
    });
  });

  describe('deleteMovie', () => {
    test('should delete the movie', () => {
      jest.spyOn(notificationService, 'success');
      const movieToDelete = testMovies[0];
      deleteSpy.mockReturnValueOnce(of({}));

      service.initialize();
      service.deleteMovie(movieToDelete);

      expect(deleteSpy).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith(expect.any(String), {
        duration: 3000
      });
    });
  });

  describe('deleteMoviesInList', () => {
    test('should delete the movies in the list', () => {
      const listId = 'list-id-here';

      service.initialize();
      service.deleteMoviesInList(listId).subscribe();

      expect(deleteMovieInListSpy).toHaveBeenCalled();
    });
  });

  describe('enableEditMode', () => {
    test('should set editMode to true', () => {
      jest.spyOn(moviesStore, 'update');

      service.initialize();
      service.enableEditMode();

      expect(moviesStore.update).toHaveBeenCalledWith({ editMode: true });
    });
  });

  describe('disableEditMode', () => {
    test('should set editMode to false', () => {
      jest.spyOn(moviesStore, 'update');

      service.initialize();
      service.disableEditMode();

      expect(moviesStore.update).toHaveBeenCalledWith({
        editMode: false
      });
    });
  });
});
