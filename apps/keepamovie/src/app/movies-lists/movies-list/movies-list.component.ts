import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MoviesList } from '../state/models/movies-list';

@Component({
  selector: 'keepadoo-movies-list',
  templateUrl: './movies-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesListComponent {
  @Input() isSelected = false;
  @Input() moviesList: MoviesList;
  @Output() listClick = new EventEmitter<string>();

  listClicked(): void {
    this.listClick.emit(this.moviesList.id);
  }
}
