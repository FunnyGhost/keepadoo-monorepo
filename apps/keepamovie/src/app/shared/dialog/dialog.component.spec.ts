import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { getElementForTest } from '../../../test-utilities/test-functions';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockComponent } from 'ng-mocks';
import { SvgIconComponent } from '@ngneat/svg-icon';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [DialogComponent, MockComponent(SvgIconComponent)]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
  });

  test('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  test('should show a close button if it can be closed', () => {
    component.canBeClosed = true;
    component.visible = true;

    fixture.detectChanges();
    const closeButton = getElementForTest(fixture, 'closeButton');

    expect(closeButton).toBeTruthy();
  });

  test('should not show a close button if it can not be closed', () => {
    component.canBeClosed = false;

    fixture.detectChanges();
    const closeButton = getElementForTest(fixture, 'closeButton');

    expect(closeButton).toBeFalsy();
  });

  test('should show an overlay if visible', () => {
    component.visible = true;

    fixture.detectChanges();
    const overlay = getElementForTest(fixture, 'overlay');

    expect(overlay).toBeTruthy();
  });

  test('should not show an overlay if not visible', () => {
    component.visible = false;

    fixture.detectChanges();
    const overlay = getElementForTest(fixture, 'overlay');

    expect(overlay).toBeFalsy();
  });

  test('should show the content if visible', () => {
    component.visible = true;

    fixture.detectChanges();
    const content = getElementForTest(fixture, 'content');

    expect(content).toBeTruthy();
  });

  test('should not show the content if not visible', () => {
    component.visible = false;

    fixture.detectChanges();
    const content = getElementForTest(fixture, 'content');

    expect(content).toBeFalsy();
  });

  test('should turn invisible when close', () => {
    component.visible = true;
    let newVisibleState = true;
    component.visibleChange.subscribe((data) => (newVisibleState = data));

    fixture.detectChanges();
    const closeButton = getElementForTest(fixture, 'closeButton');
    closeButton.triggerEventHandler('click', null);

    expect(component.visible).toBe(false);
    expect(newVisibleState).toBe(false);
  });
});
