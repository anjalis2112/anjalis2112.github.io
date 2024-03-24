import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TickerService {
  private tickerSubject = new BehaviorSubject<string | null>(null);
  ticker$ = this.tickerSubject.asObservable();

  setTicker(ticker: string) {
    this.tickerSubject.next(ticker);
  }
}
