import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { of, ReplaySubject } from 'rxjs';
import { SessionQuery } from '../../state/session.query';
import { MoviesService } from '../movies/state/movies.service';
import { MoviesList } from './models/movies-list';
import { MoviesListsQuery } from './movies-lists.query';
import { MoviesListsService } from './movies-lists.service';
import { MoviesListsStore } from './movies-lists.store';
import { HotToastService } from '@ngneat/hot-toast';
import {
  testMovieSearchResults,
  testMoviesLists,
  testUser
} from '../../../test-utilities/test-objects';

const docObject = {
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};
const firestoreMock = {
  createId() {
    /*dummy function*/
  },
  collection() {
    /*dummy function*/
  }
};

const firestoreMockSpy = jest.spyOn(firestoreMock, 'collection').mockReturnValue({
  valueChanges() {
    return of(testMoviesLists);
  },
  doc() {
    return docObject;
  }
} as any);

const activeMoviesListStream = new ReplaySubject<MoviesList>(1);
const userIdStream = new ReplaySubject<string>(1);

describe('MoviesListsService', () => {
  let sut: MoviesListsService;
  let firestoreService: AngularFirestore;
  let notificationService: HotToastService;
  let sessionQuery: SessionQuery;
  let moviesListsStore: MoviesListsStore;

  beforeEach(() => {
    const sessionQueryMock: Partial<SessionQuery> = {
      userId: () => testUser.userId,
      userId$: userIdStream.asObservable()
    };

    const moviesServiceMock: Partial<MoviesService> = {
      addMovieToList: () => of({} as any),
      deleteMoviesInList: () => of({} as any)
    };

    const notificationServiceMock: Partial<HotToastService> = {
      error: () => '' as any,
      success: () => '' as any
    };

    const moviesListsQueryMock: Partial<MoviesListsQuery> = {
      getActive: () => activeMoviesListStream.asObservable() as any
    };

    const moviesListsStoreMock: Partial<MoviesListsStore> = {
      set: () => '' as any,
      setLoading: () => '' as any,
      setError: () => '' as any,
      setActive: () => '' as any,
      removeActive: () => '' as any
    };

    TestBed.configureTestingModule({
      providers: [
        MoviesListsService,
        {
          provide: MoviesListsQuery,
          useValue: moviesListsQueryMock
        },
        {
          provide: MoviesListsStore,
          useValue: moviesListsStoreMock
        },
        {
          provide: AngularFirestore,
          useValue: firestoreMock
        },
        {
          provide: SessionQuery,
          useValue: sessionQueryMock
        },
        {
          provide: MoviesService,
          useValue: moviesServiceMock
        },
        {
          provide: HotToastService,
          useValue: notificationServiceMock
        }
      ]
    });

    sut = TestBed.inject(MoviesListsService);
    firestoreService = TestBed.inject(AngularFirestore);
    notificationService = TestBed.inject(HotToastService);
    sessionQuery = TestBed.inject(SessionQuery);
    moviesListsStore = TestBed.inject(MoviesListsStore);

    userIdStream.next(testUser.userId);
    firestoreMockSpy.mockClear();
  });

  afterEach(() => {
    sut.destroy();
  });

  test('should be created', () => {
    sut.initialize();

    expect(sut).toBeTruthy();
  });

  describe('fetch', () => {
    test('should get all the movies lists for the logged in user', () => {
      jest.spyOn(moviesListsStore, 'set');
      userIdStream.next('batman');

      sut.initialize();

      expect(firestoreMockSpy).toHaveBeenCalledWith('movies-lists', expect.any(Function));
      expect(moviesListsStore.set).toHaveBeenCalledWith(testMoviesLists);
    });
  });

  describe('add', () => {
    test('should add the movies list', () => {
      jest.spyOn(moviesListsStore, 'setLoading');
      jest.spyOn(moviesListsStore, 'setError');
      userIdStream.next('batman');
      jest.spyOn(sessionQuery, 'userId').mockReturnValueOnce(testUser.userId);
      const idToUse = '52';
      jest.spyOn(firestoreService, 'createId').mockReturnValue(idToUse);
      jest.spyOn(notificationService, 'success');
      docObject.set.mockReturnValueOnce(of({}));
      const moviesListToAdd: Partial<MoviesList> = {
        name: 'awesome movies'
      };
      const expectedMoviesList = {
        id: idToUse,
        name: 'awesome movies',
        userId: testUser.userId,
        moviesCount: 0,
        recentMovies: []
      } as MoviesList;

      sut.initialize();
      sut.add(moviesListToAdd);

      expect(docObject.set).toHaveBeenCalledWith(expectedMoviesList);
      expect(moviesListsStore.setLoading).toHaveBeenCalledTimes(2);
      expect(moviesListsStore.setLoading).toHaveBeenCalledWith(true);
      expect(moviesListsStore.setLoading).toHaveBeenLastCalledWith(false);
      expect(moviesListsStore.setError).not.toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith(expect.any(String), {
        duration: 3000
      });
    });

    test('should handle errors if adding a movies list fails', fakeAsync(() => {
      jest.spyOn(moviesListsStore, 'setLoading');
      jest.spyOn(moviesListsStore, 'setError');
      userIdStream.next('batman');
      jest.spyOn(sessionQuery, 'userId').mockReturnValueOnce(testUser.userId);
      const idToUse = '52';
      jest.spyOn(firestoreService, 'createId').mockReturnValue(idToUse);
      jest.spyOn(notificationService, 'error');
      const errorToUse = new Error('HahhahahaHahAHhAh!');
      docObject.set.mockImplementationOnce(() => {
        return Promise.reject(errorToUse);
      });
      const moviesListToAdd: Partial<MoviesList> = {
        name: 'awesome movies'
      };

      sut.initialize();
      sut.add(moviesListToAdd);

      tick();
      expect(moviesListsStore.setLoading).toHaveBeenCalledTimes(2);
      expect(moviesListsStore.setLoading).toHaveBeenCalledWith(true);
      expect(moviesListsStore.setLoading).toHaveBeenLastCalledWith(false);
      expect(moviesListsStore.setError).toHaveBeenCalledWith(errorToUse);
      expect(notificationService.error).toHaveBeenCalledWith(expect.any(String), {
        duration: 3000
      });
    }));
  });

  describe('update', () => {
    test('should update the movies list', () => {
      docObject.update.mockReturnValueOnce(of({}));
      jest.spyOn(notificationService, 'success');
      userIdStream.next('batman');

      const idToUse = '52';
      const moviesListToUpdate = {
        id: idToUse,
        name: 'awesome movies',
        userId: testUser.userId,
        moviesCount: 0
      } as MoviesList;

      sut.initialize();
      sut.update(idToUse, moviesListToUpdate);

      expect(docObject.update).toHaveBeenCalledWith(moviesListToUpdate);
      expect(notificationService.success).toHaveBeenCalledWith(expect.any(String), {
        duration: 3000
      });
    });
  });

  describe('remove', () => {
    test('should remove the movies list', () => {
      jest.spyOn(notificationService, 'success');
      jest.spyOn(moviesListsStore, 'setLoading');
      docObject.delete.mockReturnValueOnce(of({}));
      const idToUse = '52';

      sut.initialize();
      sut.remove(idToUse);

      expect(moviesListsStore.setLoading).toHaveBeenCalledTimes(2);
      expect(moviesListsStore.setLoading).toHaveBeenCalledWith(true);
      expect(moviesListsStore.setLoading).toHaveBeenLastCalledWith(false);
      expect(docObject.delete).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith(expect.any(String), {
        duration: 3000
      });
    });

    test('should remove the movies in the list', () => {
      const moviesService: MoviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'deleteMoviesInList');
      const idToUse = '52';

      sut.initialize();
      sut.remove(idToUse);

      expect(moviesService.deleteMoviesInList).toHaveBeenCalledWith(idToUse);
    });
  });

  describe('setActive', () => {
    test('should set the passed movies list id as active', () => {
      jest.spyOn(moviesListsStore, 'setActive');
      const idToUse = '52';

      sut.initialize();
      sut.setActive(idToUse);

      expect(moviesListsStore.setActive).toHaveBeenCalledWith(idToUse);
    });
  });

  describe('removeActive', () => {
    test('should remove the passed movies list id as active', () => {
      jest.spyOn(moviesListsStore, 'removeActive');
      const idToUse = '52';

      sut.initialize();
      sut.removeActive(idToUse);

      expect(moviesListsStore.removeActive).toHaveBeenCalledWith(idToUse);
    });
  });

  describe('addMovieToCurrentList', () => {
    test('should add the movie to the current list', () => {
      const movieToAdd = testMovieSearchResults[0];
      const selectedList = '123';
      const moviesListsQuery = TestBed.inject(MoviesListsQuery);
      jest.spyOn(moviesListsQuery, 'getActive').mockReturnValueOnce({
        id: selectedList
      } as MoviesList);
      const moviesService: MoviesService = TestBed.inject(MoviesService);
      jest.spyOn(moviesService, 'addMovieToList');
      jest.spyOn(notificationService, 'success');

      sut.initialize();
      sut.addMovieToCurrentList(movieToAdd);

      expect(moviesService.addMovieToList).toHaveBeenCalledWith(selectedList, movieToAdd);
      expect(notificationService.success).toHaveBeenCalledWith(expect.any(String), {
        duration: 3000
      });
    });
  });
});
