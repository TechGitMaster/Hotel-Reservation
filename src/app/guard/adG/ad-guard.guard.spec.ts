import { TestBed } from '@angular/core/testing';

import { AdGuardGuard } from './ad-guard.guard';

describe('AdGuardGuard', () => {
  let guard: AdGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
