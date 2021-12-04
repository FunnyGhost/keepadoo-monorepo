import { Injectable } from '@angular/core';
import { EMPTY, from, Observable, Subscription } from 'rxjs';
import { SessionQuery } from '../../state/session.query';
import { MovieSearchResult } from '../movie-search/state/models/movie-search-results';
import { MoviesService } from '../movies/state/movies.service';
import { MoviesList } from './models/movies-list';
import { MoviesListsQuery } from './movies-lists.query';
import { MoviesListsStore } from './movies-lists.store';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class MoviesListsService {
  private sessionSubscription: Subscription;

  constructor(
    private moviesListsQuery: MoviesListsQuery,
    private moviesListsStore: MoviesListsStore,
    private readonly firestore: Firestore,
    private sessionQuery: SessionQuery,
    private moviesService: MoviesService,
    private toast: HotToastService
  ) {}

  initialize(): void {
    this.sessionSubscription = this.sessionQuery.userId$
      .pipe(switchMap((userId) => this.setupMoviesListsCollection(userId)))
      .subscribe((moviesLists: MoviesList[]) => {
        this.moviesListsStore.set(moviesLists);
      });
  }

  add(moviesList: Partial<MoviesList>) {
    this.moviesListsStore.setLoading(true);
    const userId = this.sessionQuery.userId();
    const list = {
      ...moviesList,
      userId,
      moviesCount: 0,
      recentMovies: []
    } as MoviesList;

    from(addDoc(collection(this.firestore, `movies-lists`), list))
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

  update(id: string, moviesList: Partial<MoviesList>) {
    this.moviesListsStore.setLoading(true);
    const listToUpdate = doc(this.firestore, `movies-lists/${id}`);
    from(updateDoc(listToUpdate, moviesList)).subscribe(() => {
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
        switchMap(() => {
          const listToDelete = doc(this.firestore, `movies-lists`, id);
          return deleteDoc(listToDelete);
        }),
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

  private setupMoviesListsCollection(userId: string): Observable<MoviesList[]> {
    const moviesListsCollection = collection(
      this.firestore,
      `movies-lists`
    ).withConverter<MoviesList>({
      fromFirestore: (snapshot) => {
        const moviesList = snapshot.data();
        const { id } = snapshot;
        return { id, ...moviesList } as MoviesList;
      },
      // TODO unused can we make implicit?
      toFirestore: (it) => it
    });
    const userMoviesListsQuery = query(moviesListsCollection, where('userId', '==', userId));

    return collectionData(userMoviesListsQuery);
  }
}
