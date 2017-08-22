import { TestBed, inject } from '@angular/core/testing';

import { RuleNowService } from './rule-now.service';

describe('RuleNowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RuleNowService]
    });
  });

  it('should be created', inject([RuleNowService], (service: RuleNowService) => {
    expect(service).toBeTruthy();
  }));
});
