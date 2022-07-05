import { TestBed } from '@angular/core/testing';

import { ServtryService } from './servtry.service';

describe('ServtryService', () => {
  let service: ServtryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServtryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
