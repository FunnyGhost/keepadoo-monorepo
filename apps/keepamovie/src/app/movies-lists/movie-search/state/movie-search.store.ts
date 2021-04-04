import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { MovieSearchResult } from './models/movie-search-results';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MovieSearchState extends EntityState<MovieSearchResult> {}

@Injectable()
@StoreConfig({ name: 'movie-search' })
export class MovieSearchStore extends EntityStore<MovieSearchState, MovieSearchResult> {
  constructor() {
    super();
  }
}
