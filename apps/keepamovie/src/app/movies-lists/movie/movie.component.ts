import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Movie } from '../movies/state/models/movie';

@Component({
  selector: 'keepadoo-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComponent {
  readonly wiggleClasses = ['wiggle1', 'wiggle2'];

  @Input() editMode = false;
  @Input() movie: Movie;
  @Output() delete = new EventEmitter<Movie>();

  wiggleStyle = this.wiggleClasses[Math.floor(Math.random() * this.wiggleClasses.length)];
  animationDelay = `${MovieComponent.generateRandomNumber(-0.75, -0.15)}s`;
  animationDuration = `${MovieComponent.generateRandomNumber(0.2, 0.35)}s`;

  private static generateRandomNumber(min: number, max: number): string {
    return (Math.random() * (max - min) + min).toFixed(2);
  }

  onDelete(): void {
    this.delete.emit(this.movie);
  }
}
