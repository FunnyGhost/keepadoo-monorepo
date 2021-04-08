import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { MoviesListsService } from '../state/movies-lists.service';
import { MovieSearchResult } from './state/models/movie-search-results';
import { MovieSearchQuery } from './state/movie-search.query';
import { MovieSearchService } from './state/movie-search.service';

@Component({
  selector: 'keepadoo-movie-search',
  templateUrl: './movie-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSearchComponent implements OnInit, OnDestroy {
  movieToSearchFor = new FormControl('');
  movieResults$ = this.movieSearchQuery.selectAll();

  @Output() done = new EventEmitter<void>();

  constructor(
    private movieSearchService: MovieSearchService,
    private movieSearchQuery: MovieSearchQuery,
    private moviesListsService: MoviesListsService
  ) {}

  ngOnInit() {
    this.movieSearchService.initialize();
    this.movieToSearchFor.valueChanges.pipe(debounceTime(500)).subscribe((movieName: string) => {
      this.movieSearchService.searchMovies(movieName);
    });
  }

  addMovie(movie: MovieSearchResult): void {
    this.moviesListsService.addMovieToCurrentList(movie);
    this.onClose();
  }

  onClose(): void {
    this.movieToSearchFor.reset('', { emitEvent: false });
    this.movieSearchService.clearSearchResults();
    this.done.emit();
  }

  ngOnDestroy(): void {
    this.movieSearchService.destroy();
  }
}
