import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { ApiService } from '../api.service';
import { DataStorerService } from '../data-storer.service';

@Component({
  selector: 'app-portfolio-cards',
  standalone: true,
  imports: [CommonModule,
    MatFormField,
    MatDialogModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    NgIf,],
  templateUrl: './portfolio-cards.component.html',
  styleUrl: './portfolio-cards.component.css'
})
export class PortfolioCardsComponent {
  tradeQuantity = 0;
  stockTicker = '';
  isBuying = false;
  currentPrice: number = 0;
  currentMoney: number = 0;
  totalCost: number = 0;
  moneyNotEnough: boolean = false;
  stockNotEnough: boolean = false;
  holdingQuantity: number = 0;
  stockName: string = '';

  constructor(
    public stockModal: MatDialogRef<PortfolioCardsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiCall: ApiService,
    private dataStorer: DataStorerService
  ) { 
    console.log(data);
    this.stockTicker = data.tickerSymbol;
    this.isBuying = data.purchase;
    this.currentPrice = data.marketPrice;
    this.currentMoney = this.dataStorer.getCurrentMoney();
    this.holdingQuantity = data.ownedQuantity;
    this.stockName = data.stockName;
  }

  onTradeQuantityChange(newQuantity: number): void {
    this.tradeQuantity = newQuantity;
    this.totalCost = this.tradeQuantity * this.currentPrice;
    this.moneyNotEnough = this.currentMoney < this.totalCost;
    this.stockNotEnough = this.tradeQuantity > this.holdingQuantity;
  }
  
  onCloseClick(): void {
    this.stockModal.close();
  }

  onTradeClick(): void {
    if(this.isBuying) {
      console.log("Buying " + this.tradeQuantity + " of " + this.stockTicker + " at " + this.currentPrice + " per share");
      this.apiCall.updateHoldings(this.stockTicker, this.tradeQuantity, this.currentPrice * this.tradeQuantity)
      .subscribe({
        next: (result) => {
          console.log("Buy operation successful", result);
          this.dataStorer.setCurrentMoney(this.currentMoney - this.currentPrice * this.tradeQuantity);
          this.stockModal.close({ action: 'bought', success: true });
        },
        error: (error) => {
          console.error("Buy operation failed", error);
        }
      });
    } else {
      console.log("Selling " + this.tradeQuantity + " of " + this.stockTicker);
      this.apiCall.updateHoldings(this.stockTicker, -this.tradeQuantity, this.currentPrice * this.tradeQuantity * -1)
        .subscribe({
          next: (result) => {
            console.log("Sell operation successful", result);
            this.dataStorer.setCurrentMoney(this.currentMoney + this.currentPrice * this.tradeQuantity);
            this.stockModal.close({ action: 'sold', success: true });
          },
          error: (error) => {
            console.error("Sell operation failed", error);
          }
        });
    }

  }

}
