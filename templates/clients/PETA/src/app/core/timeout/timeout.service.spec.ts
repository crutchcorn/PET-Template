import { TestBed, inject } from '@angular/core/testing';

import { TimeoutService } from './timeout.service';

describe('TimeoutService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeoutService]
    });
  });

  it('should be created', inject([TimeoutService], (service: TimeoutService) => {
    expect(service).toBeTruthy();
  }));
});
