import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'keepadoo-slide-up',
  templateUrl: './slide-up.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideUpComponent {
  @Input() visible = false;
}
