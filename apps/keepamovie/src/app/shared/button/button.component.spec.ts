import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';
import { MockComponent } from 'ng-mocks';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { childComponents, getElementForTest } from '@test-utilities/test-functions';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonComponent, MockComponent(SvgIconComponent)]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should show the icon if present', () => {
    const iconToUse = 'batman';
    component.icon = iconToUse;
    fixture.detectChanges();

    const iconComponent = childComponents<SvgIconComponent>(fixture, SvgIconComponent)[0];

    expect(iconComponent.key).toBe(iconToUse);
  });

  test('should not show the icon if not present', () => {
    component.icon = '';
    fixture.detectChanges();

    const iconComponents = childComponents<SvgIconComponent>(fixture, SvgIconComponent);

    expect(iconComponents.length).toBe(0);
  });

  test('should be disabled if told so', () => {
    component.disabled = true;
    fixture.detectChanges();

    const button = getElementForTest(fixture, 'button');

    expect(button.nativeElement.disabled).toBeTruthy();
  });

  test('should not be disabled if told so', () => {
    component.disabled = false;
    fixture.detectChanges();

    const button = getElementForTest(fixture, 'button');

    expect(button.nativeElement.disabled).toBeFalsy();
  });

  test('should show the text', () => {
    const textToUse = 'IAmBatman';
    component.text = textToUse;
    fixture.detectChanges();

    const text = getElementForTest(fixture, 'text');

    expect(text.nativeElement.textContent).toContain(textToUse);
  });

  test('should emit when clicked', () => {
    component.disabled = true;
    fixture.detectChanges();

    let emitted = false;
    component.clicked.subscribe(() => (emitted = true));

    const button = getElementForTest(fixture, 'button');
    button.triggerEventHandler('click', null);

    expect(emitted).toBe(true);
  });
});
