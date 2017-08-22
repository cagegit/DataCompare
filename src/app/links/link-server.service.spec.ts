import { TestBed, inject } from '@angular/core/testing';

import { LinkServerService } from './link-server.service';

describe('LinkServerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LinkServerService]
    });
  });

  it('should be created', inject([LinkServerService], (service: LinkServerService) => {
    expect(service).toBeTruthy();
  }));
});
