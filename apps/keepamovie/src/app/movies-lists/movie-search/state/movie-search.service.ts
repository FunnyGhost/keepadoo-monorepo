import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { MovieSearchResult } from './models/movie-search-results';
import { MovieSearchStore } from './movie-search.store';
import { Subject, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MovieSearchService {
  searchTerm$ = new Subject<string>();

  private searchSubscription: Subscription;

  constructor(private movieSearchStore: MovieSearchStore, private http: HttpClient) {}

  initialize(): void {
    this.searchSubscription = this.searchTerm$
      .pipe(switchMap((text) => this.updateSearchResults(text)))
      .subscribe((entities) => this.movieSearchStore.set(entities));
  }

  searchMovies(text: string): void {
    this.searchTerm$.next(text);
  }

  private updateSearchResults(text: string) {
    const urlToUse = `${environment.tmdbConfig.apiUrl}/search/movie`;
    const params = new HttpParams()
      .set('api_key', environment.tmdbConfig.api_key)
      .set('query', text);

    return this.http.get(urlToUse, { params }).pipe(
      map((response: any) => response.results as MovieSearchResult[]),
      map((data) => {
        return data.filter((movieSearchResult) => !!movieSearchResult.poster_path);
      })
    );
  }

  clearSearchResults(): void {
    this.movieSearchStore.set([]);
  }

  destroy(): void {
    this.searchSubscription.unsubscribe();
  }
}
