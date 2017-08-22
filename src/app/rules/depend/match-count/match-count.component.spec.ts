import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchCountComponent } from './match-count.component';

describe('MatchCountComponent', () => {
  let component: MatchCountComponent;
  let fixture: ComponentFixture<MatchCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
