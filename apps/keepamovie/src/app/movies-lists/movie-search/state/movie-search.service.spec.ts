import { HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { MovieSearchResult } from './models/movie-search-results';
import { MovieSearchService } from './movie-search.service';
import { MovieSearchStore } from './movie-search.store';

describe('MovieSearchService', () => {
  let movieSearchService: MovieSearchService;
  let movieSearchStore: MovieSearchStore;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovieSearchService, MovieSearchStore],
      imports: [HttpClientTestingModule]
    });

    movieSearchService = TestBed.inject(MovieSearchService);
    movieSearchStore = TestBed.inject(MovieSearchStore);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    movieSearchService.destroy();
  });

  test('should be created', () => {
    movieSearchService.initialize();

    expect(movieSearchService).toBeDefined();
  });

  describe('searchMovies', () => {
    beforeEach(() => {
      jest.spyOn(movieSearchStore, 'set');
    });

    test('should get movie search results from tmdb and put them in the store', inject(
      [MovieSearchService],
      (service: MovieSearchService) => {
        const searchText = 'Thor';
        const dataToReturn = {
          results: [
            {
              title: 'Thor',
              overview: 'Something about a greek god..',
              poster_path: 'poster-1-here'
            } as MovieSearchResult,
            {
              title: 'Iron man',
              overview: 'Something about a dude with an iron suit..',
              poster_path: 'poster-2-here'
            } as MovieSearchResult
          ]
        };

        movieSearchService.initialize();
        service.searchMovies(searchText);

        const req = httpTestingController.expectOne((request: HttpRequest<any>) => {
          const containsUrl = request.url.includes(environment.tmdbConfig.apiUrl);
          const containsKey = request.params.get('api_key') === environment.tmdbConfig.api_key;
          const containsSearchQuery = request.params.get('query') === searchText;
          return containsUrl && containsKey && containsSearchQuery;
        });

        expect(req.request.method).toEqual('GET');

        req.flush(dataToReturn);
        expect(movieSearchStore.set).toHaveBeenCalledWith(dataToReturn.results);

        httpTestingController.verify();
      }
    ));

    test('should filter movie search results without a poster from tmdb', () => {
      inject([MovieSearchService], (service: MovieSearchService) => {
        const searchText = 'Thor';
        const dataToReturn = {
          results: [
            {
              title: 'Thor',
              overview: 'Something about a greek god..',
              poster_path: 'thor-poster'
            } as MovieSearchResult,
            {
              title: 'Iron man',
              overview: 'Something about a dude with an iron suit..',
              poster_path: 'iron-man-poster'
            } as MovieSearchResult,
            {
              title: 'Chinese Iron Man',
              overview: 'Something about a chinese dude with an iron suit..',
              poster_path: ''
            } as MovieSearchResult
          ]
        };

        movieSearchService.initialize();
        service.searchMovies(searchText);

        const req = httpTestingController.expectOne((request: HttpRequest<any>) => {
          const containsUrl = request.url.includes(environment.tmdbConfig.apiUrl);
          const containsKey = request.params.get('api_key') === environment.tmdbConfig.api_key;
          const containsSearchQuery = request.params.get('query') === searchText;
          return containsUrl && containsKey && containsSearchQuery;
        });

        expect(req.request.method).toEqual('GET');

        req.flush(dataToReturn);
        expect(movieSearchStore.set).toHaveBeenCalledWith([
          dataToReturn.results[0],
          dataToReturn.results[1]
        ]);
        httpTestingController.verify();
      })();
    });

    test('should clear the store when asked to', () => {
      movieSearchService.initialize();
      movieSearchService.clearSearchResults();

      expect(movieSearchStore.set).toHaveBeenCalledWith([]);
    });
  });
});
