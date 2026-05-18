import { TestBed } from '@angular/core/testing';

import { Responsibility } from './responsibility';

describe('Responsibility', () => {
  let service: Responsibility;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Responsibility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
