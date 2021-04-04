import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { of, ReplaySubject, Subject } from 'rxjs';
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

describe('MoviesService', () => {
  let service: MoviesService;
  let moviesStore: MoviesStore;
  let notificationService: HotToastService;

  const firestoreMock = {
    collection() {
      /*dummy function*/
    }
  };

  const addSpy = jest.fn();
  const deleteSpy = jest.fn();

  const deleteMovieInListSpy = jest.fn().mockReturnValue(of());
  jest.spyOn(firestoreMock, 'collection').mockReturnValue({
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

  const userIdStream = new ReplaySubject<string>();
  const sessionQueryMock = {
    userId: () => testUser.userId,
    userId$: userIdStream.asObservable()
  };

  const activeList = new Subject<MoviesList>();
  const moviesListsQueryMock = {
    selectActive: () => activeList.asObservable()
  };

  const notificationServiceMock = {
    error: () => {
      /*dummy function*/
    },
    success: () => {
      /*dummy function*/
    }
  };

  const moviesStoreMock: Partial<MoviesStore> = {
    set: () => {
      /*dummy function*/
    },
    remove: () => {
      /*dummy function*/
    },
    update: () => {
      /*dummy function*/
    },
    setLoading: () => {
      /*dummy function*/
    }
  };

  beforeEach(() => {
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

    service = TestBed.inject(MoviesService);
    moviesStore = TestBed.inject(MoviesStore);
    notificationService = TestBed.inject(HotToastService);
  });

  afterEach(() => {
    service.destroy();
  });

  test('should be created', () => {
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
        activeList.next(testMoviesLists[0]);

        expect(moviesStore.set).toHaveBeenCalledWith(testMovies);
        expect(service.getMoviesInList).toHaveBeenCalledWith(testMoviesLists[0].id);
      });

      test('should correctly handle the loading state', () => {
        jest.spyOn(moviesStore, 'setLoading');
        activeList.next(testMoviesLists[0]);

        expect(moviesStore.setLoading).toHaveBeenCalledTimes(2);
        expect(moviesStore.setLoading).toHaveBeenCalledWith(true);
        expect(moviesStore.setLoading).toHaveBeenLastCalledWith(false);
      });

      test('should clear the store if there is no selected list', () => {
        jest.spyOn(moviesStore, 'set');
        activeList.next(undefined);

        expect(moviesStore.set).toHaveBeenCalledWith([]);
      });
    });

    describe('User is not logged in', () => {
      test('should clear the store', () => {
        jest.spyOn(moviesStore, 'set');

        userIdStream.next('');
        activeList.next(testMoviesLists[0]);

        expect(moviesStore.set).toHaveBeenCalledWith([]);
      });
    });
  });

  describe('getMoviesInList', () => {
    test('should get movies in list', (done) => {
      service.getMoviesInList('1').subscribe((data: Movie[]) => {
        expect(data).toEqual(testMovies);
        done();
      });
    });
  });

  describe('addMovieToList', () => {
    test('should add the movie to the list', async () => {
      const listId = '123';
      const movieToAdd = testMovieSearchResults[0];

      await service.addMovieToList(listId, movieToAdd);
      expect(addSpy).toHaveBeenCalledWith({
        ...movieToAdd,
        listId,
        added_on: expect.any(String)
      });
    });
  });

  describe('deleteMovie', () => {
    test('should delete the movie', async () => {
      jest.spyOn(notificationService, 'success');
      jest.spyOn(moviesStore, 'remove');

      const movieToDelete = testMovies[0];

      await service.deleteMovie(movieToDelete);
      expect(deleteSpy).toHaveBeenCalled();
      expect(moviesStore.remove).toHaveBeenCalledWith(movieToDelete.id);
      expect(notificationService.success).toHaveBeenCalledWith(expect.any(String), {
        duration: 3000
      });
    });
  });

  describe('deleteMoviesInList', () => {
    test('should delete the movies in the list', async () => {
      const listId = 'list-id-here';

      await service.deleteMoviesInList(listId);
      expect(deleteMovieInListSpy).toHaveBeenCalled();
    });
  });

  describe('enableEditMode', () => {
    test('should set editMode to true', () => {
      jest.spyOn(moviesStore, 'update');

      service.enableEditMode();
      expect(moviesStore.update).toHaveBeenCalledWith({ editMode: true });
    });
  });

  describe('disableEditMode', () => {
    test('should set editMode to false', () => {
      jest.spyOn(moviesStore, 'update');

      service.disableEditMode();
      expect(moviesStore.update).toHaveBeenCalledWith({
        editMode: false
      });
    });
  });
});
