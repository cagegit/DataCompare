import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbPanelComComponent } from './db-panel-com.component';

describe('DbPanelComComponent', () => {
  let component: DbPanelComComponent;
  let fixture: ComponentFixture<DbPanelComComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbPanelComComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbPanelComComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
