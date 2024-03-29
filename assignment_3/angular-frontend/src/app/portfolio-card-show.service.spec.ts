import { TestBed } from '@angular/core/testing';

import { PortfolioCardShowService } from './portfolio-card-show.service';

describe('PortfolioCardShowService', () => {
  let service: PortfolioCardShowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioCardShowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
