import { TestBed, inject } from '@angular/core/testing';

import { BootstrapDialogService } from './bootstrap-dialog.service';

describe('BootstrapDialogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BootstrapDialogService]
    });
  });

  it('should be created', inject([BootstrapDialogService], (service: BootstrapDialogService) => {
    expect(service).toBeTruthy();
  }));
});
