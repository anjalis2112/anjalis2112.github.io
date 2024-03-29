import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinnhubFooterComponent } from './finnhub-footer.component';

describe('FinnhubFooterComponent', () => {
  let component: FinnhubFooterComponent;
  let fixture: ComponentFixture<FinnhubFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinnhubFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinnhubFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
