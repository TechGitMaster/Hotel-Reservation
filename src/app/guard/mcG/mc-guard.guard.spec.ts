import { TestBed } from '@angular/core/testing';

import { McGuardGuard } from './mc-guard.guard';

describe('McGuardGuard', () => {
  let guard: McGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(McGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
