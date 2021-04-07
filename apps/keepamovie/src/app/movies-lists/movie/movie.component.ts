import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Movie } from '../movies/state/models/movie';

@Component({
  selector: 'keepadoo-movie',
  templateUrl: './movie.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComponent {
  @Input() editMode = false;
  @Input() movie: Movie;

  @Output() delete = new EventEmitter<Movie>();

  onDelete(): void {
    this.delete.emit(this.movie);
  }
}
