import { TestBed } from '@angular/core/testing';

import { DataStorerService } from './data-storer.service';

describe('DataStorerService', () => {
  let service: DataStorerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataStorerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
