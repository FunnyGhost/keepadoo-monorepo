import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'keepadoo-button',
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() icon = '';
  @Input() text = '';
  @Input() disabled = false;
  @Input() buttonType: 'primary' | 'secondary' | 'warning' = 'primary';

  @Output()
  clicked = new EventEmitter<void>();

  get isPrimary(): boolean {
    return this.buttonType === 'primary' && !this.disabled;
  }

  get isSecondary(): boolean {
    return this.buttonType === 'secondary' && !this.disabled;
  }

  get isWarning(): boolean {
    return this.buttonType === 'warning' && !this.disabled;
  }

  onClick(): void {
    this.clicked.emit();
  }
}
