import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportConfComponent } from './import-conf.component';

describe('ImportConfComponent', () => {
  let component: ImportConfComponent;
  let fixture: ComponentFixture<ImportConfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportConfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
