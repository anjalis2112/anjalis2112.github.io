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
  selector: 'app-custom-portfolio-cards',
  templateUrl: './custom-portfolio-cards.component.html',
  styleUrls: ['./custom-portfolio-cards.component.css'],
  standalone: true,
  imports: [CommonModule,
    MatFormField,
    MatDialogModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    NgIf,],
})
export class CustomPortfolioCardsComponent {
  transactionAmount = 0;
  selectedStock = '';
  isPurchase = false;
  currentPrice = 0;
  currentFunds = 0;
  totalTransactionCost = 0;
  insufficientFunds = false;
  insufficientStocks = false;
  availableStocks = 0;
  companyName = '';

  constructor(
    public stockModal: MatDialogRef<CustomPortfolioCardsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private apiService: ApiService,
    private dataService: DataStorerService
  ) {
    this.selectedStock = dialogData.stockSymbol;
    this.isPurchase = dialogData.purchase;
    this.currentPrice = dialogData.price;
    this.currentFunds = this.dataService.getCurrentFunds();
    this.availableStocks = dialogData.quantity;
    this.companyName = dialogData.companyName;
  }

  onAmountChange(newAmount: number): void {
    this.transactionAmount = newAmount;
    this.totalTransactionCost = this.transactionAmount * this.currentPrice;
    this.insufficientFunds = this.currentFunds < this.totalTransactionCost;
    this.insufficientStocks = this.transactionAmount > this.availableStocks;
  }

  onClose(): void {
    this.stockModal.close();
  }

  onTransaction(): void {
    if (this.isPurchase) {
      console.log("Buying " + this.transactionAmount + " of " + this.selectedStock + " at " + this.currentPrice + " per share");
      this.apiService.updateHoldings(this.selectedStock, this.transactionAmount, this.currentPrice * this.transactionAmount)
        .subscribe({
          next: (result) => {
            console.log("Buy operation successful", result);
            this.dataService.setCurrentFunds(this.currentFunds - this.totalTransactionCost);
            this.stockModal.close({ action: 'bought', success: true });
          },
          error: (error) => {
            console.error("Buy operation failed", error);
          }
        });
    } else {
      console.log("Selling " + this.transactionAmount + " of " + this.selectedStock);
      this.apiService.updateHoldings(this.selectedStock, -this.transactionAmount, this.currentPrice * this.transactionAmount * -1)
        .subscribe({
          next: (result) => {
            console.log("Sell operation successful", result);
            this.dataService.setCurrentFunds(this.currentFunds + this.totalTransactionCost);
            this.stockModal.close({ action: 'sold', success: true });
          },
          error: (error) => {
            console.error("Sell operation failed", error);
          }
        });
    }
  }
}
