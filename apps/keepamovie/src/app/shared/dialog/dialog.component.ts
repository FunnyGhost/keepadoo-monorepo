import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'keepadoo-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dialog', [
      transition('void => *', [style({ transform: 'scale3d(.3, .3, .3)' }), animate(100)]),
      transition('* => void', [animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))])
    ])
  ]
})
export class DialogComponent {
  @Input() canBeClosed = true;
  @Input() visible: boolean;
  @Output() visibleChange = new EventEmitter<boolean>();

  close(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}
