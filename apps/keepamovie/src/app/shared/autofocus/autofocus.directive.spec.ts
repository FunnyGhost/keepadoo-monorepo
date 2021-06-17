import { AutofocusDirective } from './autofocus.directive';
import { ElementRef } from '@angular/core';

describe('AutofocusDirective', () => {
  it('should create an instance', () => {
    const directive = new AutofocusDirective({} as ElementRef);
    expect(directive).toBeTruthy();
  });

  it('should focus the element', () => {
    const elementRef = {
      nativeElement: {
        focus: () => ''
      }
    } as ElementRef;
    jest.spyOn(elementRef.nativeElement, 'focus');

    const directive = new AutofocusDirective(elementRef);
    directive.ngAfterViewInit();

    expect(elementRef.nativeElement.focus).toHaveBeenCalled();
  });
});
