import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MoviesListsService } from '../state/movies-lists.service';
import { MovieSearchResult } from './state/models/movie-search-results';
import { MovieSearchQuery } from './state/movie-search.query';
import { MovieSearchService } from './state/movie-search.service';

@Component({
  selector: 'keepadoo-movie-search',
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSearchComponent implements OnInit {
  movieToSearchFor = new FormControl('');
  movieResults$: Observable<MovieSearchResult[]>;

  @Output() done = new EventEmitter<void>();

  constructor(
    private movieSearchService: MovieSearchService,
    private movieSearchQuery: MovieSearchQuery,
    private moviesListsService: MoviesListsService
  ) {}

  ngOnInit() {
    this.movieResults$ = this.movieSearchQuery.selectAll();

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
}
