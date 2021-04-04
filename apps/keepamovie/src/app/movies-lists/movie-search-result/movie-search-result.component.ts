import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MovieSearchResult } from '../movie-search/state/models/movie-search-results';

@Component({
  selector: 'keepadoo-movie-search-result',
  templateUrl: './movie-search-result.component.html',
  styleUrls: ['./movie-search-result.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSearchResultComponent {
  @Input() movie: MovieSearchResult;
  @Output() movieAddedToList = new EventEmitter<MovieSearchResult>();

  addMovieToList(): void {
    this.movieAddedToList.emit(this.movie);
  }
}
