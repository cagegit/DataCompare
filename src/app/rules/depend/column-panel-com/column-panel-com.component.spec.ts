import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnPanelComComponent } from './column-panel-com.component';

describe('ColumnPanelComComponent', () => {
  let component: ColumnPanelComComponent;
  let fixture: ComponentFixture<ColumnPanelComComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnPanelComComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnPanelComComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
