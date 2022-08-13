import { TestBed } from '@angular/core/testing';

import { AdServiceService } from './ad-service.service';

describe('AdServiceService', () => {
  let service: AdServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
