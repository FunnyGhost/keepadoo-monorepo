import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideUpComponent } from './slide-up.component';

describe('SlideUpComponent', () => {
  let component: SlideUpComponent;
  let fixture: ComponentFixture<SlideUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlideUpComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlideUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
