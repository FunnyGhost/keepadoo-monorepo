import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Movie } from '../movies/state/models/movie';
import { MoviesQuery } from '../movies/state/movies.query';
import { MoviesService } from '../movies/state/movies.service';
import { MoviesList } from '../state/models/movies-list';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';

@Component({
  selector: 'keepadoo-movies-list-details',
  templateUrl: './movies-list-details.component.html',
  styleUrls: ['./movies-list-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesListDetailsComponent implements OnInit, OnDestroy {
  movies$ = this.moviesQuery.selectAll();
  isLoading$ = this.moviesQuery.selectLoading();
  selectedList$ = this.moviesListQuery.selectActive() as Observable<MoviesList>;
  editMode$ = this.moviesQuery.select().pipe(map((state) => state.editMode));

  showConfirmationDialog: boolean;
  addMovieMode = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private moviesListsService: MoviesListsService,
    private moviesService: MoviesService,
    private moviesQuery: MoviesQuery,
    private moviesListQuery: MoviesListsQuery,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const listId = params.get('id');
      this.moviesListsService.setActive(listId);
    });
  }

  edit(): void {
    this.moviesService.enableEditMode();
  }

  done(): void {
    this.moviesService.disableEditMode();
  }

  enableAddMode(): void {
    this.addMovieMode = true;
  }

  disableAddMode(): void {
    this.addMovieMode = false;
  }

  askForDeleteConfirmation(): void {
    this.showConfirmationDialog = true;
  }

  deleteList(): void {
    this.selectedList$.pipe(take(1)).subscribe((data) => {
      this.moviesListsService.remove(data.id);
      this.showConfirmationDialog = false;
      this.goBack();
    });
  }

  cancelListDeletion(): void {
    this.showConfirmationDialog = false;
  }

  deleteMovie(movie: Movie) {
    this.moviesService.deleteMovie(movie);
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  ngOnDestroy(): void {
    this.moviesService.disableEditMode();
  }
}
