import { Injectable } from '@angular/core';
import { combineLatest, from, Observable, of, Subscription } from 'rxjs';
import { map, mergeMap, reduce, switchMap, take } from 'rxjs/operators';
import { SessionQuery } from '../../../state/session.query';
import { MovieSearchResult } from '../../movie-search/state/models/movie-search-results';
import { MoviesList } from '../../state/models/movies-list';
import { MoviesListsQuery } from '../../state/movies-lists.query';
import { Movie } from './models/movie';
import { MoviesStore } from './movies.store';
import { HotToastService } from '@ngneat/hot-toast';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private setupSubscription: Subscription;

  constructor(
    private firestoreService: AngularFirestore,
    private sessionQuery: SessionQuery,
    private moviesListsQuery: MoviesListsQuery,
    private moviesStore: MoviesStore,
    private notificationService: HotToastService
  ) {}

  initialize(): void {
    this.setupSubscription = combineLatest([
      this.sessionQuery.userId$,
      this.moviesListsQuery.selectActive()
    ])
      .pipe(
        switchMap(([userId, moviesList]: [string, MoviesList]) => {
          this.moviesStore.setLoading(true);
          if (!userId || !moviesList) {
            return of([]);
          } else {
            return this.getMoviesInList(moviesList.id);
          }
        })
      )
      .subscribe((movies) => {
        this.moviesStore.set(movies);
        this.moviesStore.setLoading(false);
      });
  }

  public getMoviesInList(listId: string): Observable<Movie[]> {
    return this.firestoreService
      .collection<Movie[]>(
        `movies`,
        /* istanbul ignore next */
        (ref) => ref.where('listId', '==', listId).orderBy('added_on', 'desc')
      )
      .valueChanges({ idField: 'key' })
      .pipe(map((data) => data as unknown as Movie[]));
  }

  public addMovieToList(listId: string, movie: MovieSearchResult) {
    const addedOn = new Date().toISOString();
    return from(
      this.firestoreService.collection(`movies`).add({ ...movie, listId, added_on: addedOn })
    );
  }

  public deleteMovie(movie: Movie) {
    const movieToDelete = this.firestoreService.collection(`movies`).doc(movie.key);
    from(movieToDelete.delete()).subscribe(() => {
      this.notificationService.success('Movie deleted!', {
        duration: 3000
      });
    });
  }

  public deleteMoviesInList(listId: string): Observable<boolean> {
    return this.firestoreService
      .collection(`movies`, (ref) => ref.where('listId', '==', listId))
      .snapshotChanges()
      .pipe(
        take(1),
        switchMap((data) => {
          if (data.length)
            return from(data).pipe(
              mergeMap((item) => item.payload.doc.ref.delete()),
              reduce(() => undefined)
            );

          return of(true);
        })
      );
  }

  public enableEditMode(): void {
    this.moviesStore.update({ editMode: true });
  }

  public disableEditMode(): void {
    this.moviesStore.update({ editMode: false });
  }

  public destroy(): void {
    this.setupSubscription.unsubscribe();
  }
}
