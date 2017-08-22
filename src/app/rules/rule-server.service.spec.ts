import { TestBed, inject } from '@angular/core/testing';

import { RuleServerService } from './rule-server.service';

describe('RuleServerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RuleServerService]
    });
  });

  it('should be created', inject([RuleServerService], (service: RuleServerService) => {
    expect(service).toBeTruthy();
  }));
});
