import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePanelComComponent } from './table-panel-com.component';

describe('TablePanelComComponent', () => {
  let component: TablePanelComComponent;
  let fixture: ComponentFixture<TablePanelComComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablePanelComComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablePanelComComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
