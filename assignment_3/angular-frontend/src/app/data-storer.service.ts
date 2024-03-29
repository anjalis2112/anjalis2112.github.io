import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataStorerService {
  getLastSearchArg(): string {
    return this.lastSearchArg;
  }

  getCurrentMoney(): number {
    return this.currentMoney;
  }

  private lastSearchArg: string = '';
  private lastSearchResult: any;
  private currentMoney: number = 25000.00;

  constructor() { }

  setLastSearchArg(arg: string): void {
    this.lastSearchArg = arg;
  }

  clearLastSearch(): void {
    this.lastSearchArg = '';
    this.lastSearchResult = null;
  }

  setCurrentMoney(money: number): void {
    this.currentMoney = money;
  }

}

