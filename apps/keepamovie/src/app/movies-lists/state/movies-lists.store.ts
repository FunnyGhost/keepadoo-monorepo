import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { MoviesList } from './models/movies-list';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MoviesListsState extends EntityState<MoviesList> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'movies-lists' })
export class MoviesListsStore extends EntityStore<MoviesListsState, MoviesList> {
  constructor() {
    super();
  }
}
