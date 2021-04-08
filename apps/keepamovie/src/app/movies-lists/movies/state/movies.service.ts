import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, from, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { SessionQuery } from '../../../state/session.query';
import { MovieSearchResult } from '../../movie-search/state/models/movie-search-results';
import { MoviesList } from '../../state/models/movies-list';
import { MoviesListsQuery } from '../../state/movies-lists.query';
import { Movie } from './models/movie';
import { MoviesStore } from './movies.store';
import { HotToastService } from '@ngneat/hot-toast';

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
        (ref) => ref.where('listId', '==', listId)
      )
      .valueChanges({ idField: 'key' })
      .pipe(map((data) => (data as unknown) as Movie[]));
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

  public deleteMoviesInList(listId: string): Observable<void> {
    return this.firestoreService
      .collection(`movies`, (ref) => ref.where('listId', '==', listId))
      .snapshotChanges()
      .pipe(
        take(1),
        switchMap((data) => from(data)),
        switchMap((item) => item.payload.doc.ref.delete())
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
