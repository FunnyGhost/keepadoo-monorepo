import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingComponent } from './rating.component';
import { MockComponent } from 'ng-mocks';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { childComponents, getElementForTest } from '@test-utilities/test-functions';

describe('RatingComponent', () => {
  let component: RatingComponent;
  let fixture: ComponentFixture<RatingComponent>;

  const ratingToUse = 6.6;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RatingComponent, MockComponent(SvgIconComponent)]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingComponent);
    component = fixture.componentInstance;
    component.rating = ratingToUse;

    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should show the star icon', () => {
    const svgIcon = childComponents<SvgIconComponent>(fixture, SvgIconComponent)[0];

    expect(svgIcon.key).toEqual('star');
  });

  test('should show the rating', () => {
    const ratingElement = getElementForTest(fixture, 'rating');

    expect(ratingElement.nativeElement.textContent).toContain(ratingToUse);
  });
});
