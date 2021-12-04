import { Injectable } from '@angular/core';
import { combineLatest, from, Observable, of, Subscription } from 'rxjs';
import { concatAll, mapTo, mergeMap, switchMap, take, toArray } from 'rxjs/operators';
import { SessionQuery } from '../../../state/session.query';
import { MovieSearchResult } from '../../movie-search/state/models/movie-search-results';
import { MoviesList } from '../../state/models/movies-list';
import { MoviesListsQuery } from '../../state/movies-lists.query';
import { Movie } from './models/movie';
import { MoviesStore } from './movies.store';
import { HotToastService } from '@ngneat/hot-toast';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  where
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private setupSubscription: Subscription;

  constructor(
    private readonly firestore: Firestore,
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
    const moviesCollection = collection(this.firestore, `movies`).withConverter<Movie>({
      fromFirestore: (snapshot) => {
        const movie = snapshot.data();
        const key = snapshot.id;
        return { key, ...movie } as Movie;
      },
      // TODO unused can we make implicit?
      toFirestore: (it) => it
    });
    const userMoviesListsQuery = query(
      moviesCollection,
      where('listId', '==', listId),
      orderBy('added_on', 'desc')
    );

    return collectionData(userMoviesListsQuery);
  }

  public addMovieToList(listId: string, movie: MovieSearchResult) {
    const added_on = new Date().toISOString();
    return from(addDoc(collection(this.firestore, `movies`), { ...movie, listId, added_on }));
  }

  public deleteMovie(movie: Movie) {
    const movieToDelete = doc(this.firestore, 'movies', movie.key);
    from(deleteDoc(movieToDelete)).subscribe(() => {
      this.notificationService.success('Movie deleted!', {
        duration: 3000
      });
    });
  }

  public deleteMoviesInList(listId: string): Observable<boolean> {
    const moviesCollection = collection(this.firestore, `movies`).withConverter<Movie>({
      fromFirestore: (snapshot) => {
        const movie = snapshot.data();
        const key = snapshot.id;
        return { key, ...movie } as Movie;
      },
      // TODO unused can we make implicit?
      toFirestore: (it) => it
    });
    const moviesToDeleteQuery = query(moviesCollection, where('listId', '==', listId));

    return collectionData(moviesToDeleteQuery).pipe(
      take(1),
      concatAll(),
      mergeMap((data: Movie) => deleteDoc(doc(this.firestore, 'movies', data.key))),
      toArray(),
      mapTo(true)
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
