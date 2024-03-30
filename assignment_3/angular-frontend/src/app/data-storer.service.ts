import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataStorerService {
  getLastSearchArg(): string {
    console.log('Inside get Last search arg:', this.prevSearch);
    return this.prevSearch;
  }

  getCurrentMoney(): number {
    return this.currentMoney;
  }

  private prevSearch: string = '';
  private currentMoney: number = 25000.00;

  constructor() { }

  setLastSearchArg(arg: string): void {
    this.prevSearch = arg;
    console.log('Last search arg set to:', this.prevSearch);
  }

  clearLastSearch(): void {
    this.prevSearch = '';
  }

  setCurrentMoney(money: number): void {
    this.currentMoney = money;
  }

}

