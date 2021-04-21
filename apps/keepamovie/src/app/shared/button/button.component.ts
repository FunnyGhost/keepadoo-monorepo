import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'keepadoo-button',
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  @Input() icon = '';
  @Input() text = '';
  @Input() disabled: boolean;
  @Input() buttonType: 'primary' | 'secondary' | 'warning' = 'primary';

  @Output()
  clicked = new EventEmitter<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
