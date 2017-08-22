import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyToOtherComponent } from './apply-to-other.component';

describe('ApplyToOtherComponent', () => {
  let component: ApplyToOtherComponent;
  let fixture: ComponentFixture<ApplyToOtherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyToOtherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyToOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
