import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'keepadoo-rating',
  templateUrl: './rating.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingComponent {
  @Input() rating: number;
}
