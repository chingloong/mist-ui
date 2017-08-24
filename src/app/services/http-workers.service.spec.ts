import { TestBed, inject } from '@angular/core/testing';

import { HttpWorkersService } from './http-workers.service';

describe('HttpWorkersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpWorkersService]
    });
  });

  it('should be created', inject([HttpWorkersService], (service: HttpWorkersService) => {
    expect(service).toBeTruthy();
  }));
});
