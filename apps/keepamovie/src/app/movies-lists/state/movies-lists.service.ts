import { Injectable } from '@angular/core';
import { EMPTY, from, Subscription } from 'rxjs';
import { SessionQuery } from '../../state/session.query';
import { MovieSearchResult } from '../movie-search/state/models/movie-search-results';
import { MoviesService } from '../movies/state/movies.service';
import { MoviesList } from './models/movies-list';
import { MoviesListsQuery } from './movies-lists.query';
import { MoviesListsStore } from './movies-lists.store';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({ providedIn: 'root' })
export class MoviesListsService {
  private moviesListsCollection: AngularFirestoreCollection;
  private sessionSubscription: Subscription;

  constructor(
    private moviesListsQuery: MoviesListsQuery,
    private moviesListsStore: MoviesListsStore,
    private firestoreService: AngularFirestore,
    private sessionQuery: SessionQuery,
    private moviesService: MoviesService,
    private toast: HotToastService
  ) {}

  initialize(): void {
    this.sessionSubscription = this.sessionQuery.userId$
      .pipe(
        switchMap((userId) => {
          this.setupMoviesListsCollection(this.firestoreService, userId);
          return this.moviesListsCollection.valueChanges({ idField: 'id' });
        })
      )
      .subscribe((moviesLists: MoviesList[]) => {
        this.moviesListsStore.set(moviesLists);
      });
  }

  add(moviesList: Partial<MoviesList>) {
    this.moviesListsStore.setLoading(true);
    const userId = this.sessionQuery.userId();
    const id = this.firestoreService.createId();
    const list = {
      ...moviesList,
      id,
      userId,
      moviesCount: 0,
      recentMovies: []
    } as MoviesList;

    from(this.moviesListsCollection.doc(id).set(list))
      .pipe(
        catchError((err) => {
          this.moviesListsStore.setError(err);
          this.toast.error('List creation failed.', {
            duration: 3000
          });

          return EMPTY;
        }),
        finalize(() => this.moviesListsStore.setLoading(false))
      )
      .subscribe(() => {
        this.toast.success('List created!', {
          duration: 3000
        });
      });
  }

  update(id, moviesList: Partial<MoviesList>) {
    this.moviesListsStore.setLoading(true);
    from(this.moviesListsCollection.doc(id).update(moviesList)).subscribe(() => {
      this.moviesListsStore.setLoading(false);
      this.toast.success('List updated!', {
        duration: 3000
      });
    });
  }

  remove(id: string) {
    this.moviesListsStore.setLoading(true);
    this.moviesService
      .deleteMoviesInList(id)
      .pipe(
        switchMap(() => this.moviesListsCollection.doc(id).delete()),
        finalize(() => {
          this.moviesListsStore.setLoading(false);
          this.toast.success('List deleted!', {
            duration: 3000
          });
        })
      )
      .subscribe();
  }

  setActive(id: string): void {
    this.moviesListsStore.setActive(id);
  }

  removeActive(id: string): void {
    this.moviesListsStore.removeActive(id);
  }

  addMovieToCurrentList(movie: MovieSearchResult) {
    const activeList = this.moviesListsQuery.getActive() as MoviesList;
    this.moviesService.addMovieToList(activeList.id, movie).subscribe(() => {
      this.toast.success('Movie added!', {
        duration: 3000
      });
    });
  }

  destroy(): void {
    this.sessionSubscription.unsubscribe();
  }

  private setupMoviesListsCollection(firestoreService: AngularFirestore, userId: string): void {
    this.moviesListsCollection = firestoreService.collection(
      `movies-lists`,
      /* istanbul ignore next */
      (ref) => ref.where('userId', '==', userId)
    );
  }
}
