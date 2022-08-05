import { TestBed } from '@angular/core/testing';

import { AuServiceService } from './au-service.service';

describe('AuServiceService', () => {
  let service: AuServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
