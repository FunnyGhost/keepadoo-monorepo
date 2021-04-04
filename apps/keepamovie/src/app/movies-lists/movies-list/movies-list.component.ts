import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MoviesList } from '../state/models/movies-list';

@Component({
  selector: 'keepadoo-movies-list',
  templateUrl: './movies-list.component.html',
  styleUrls: ['./movies-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesListComponent {
  @Input() moviesList: MoviesList;
  @Output() listClick = new EventEmitter<string>();

  listClicked(): void {
    this.listClick.emit(this.moviesList.id);
  }
}
