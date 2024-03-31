import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, NgFor } from '@angular/common';
import { ApiService } from '../api.service';
import { Subject, Subscription, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PortfolioCardShowService } from '../portfolio-card-show.service';
import { PortfolioCardsComponent } from '../portfolio-cards/portfolio-cards.component';

// Interfaces for data structures
interface QuoteData {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

interface HoldingData {
  id: number;
  ticker: string;
  quantity: number;
  cost: number;
}

interface StockName {
  name: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    NgIf,
    NgFor,
    CommonModule
  ],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent {
  currentMoney = 0;
  isLoading = false;
  holdings: HoldingData[] = [];
  holdingQuote: QuoteData[] = [];
  stockData: StockName[] = [];
  changeValue: any;
  searchResult: any;
  subscription: Subscription = new Subscription();
  private tradeStockAlert = new Subject<string>();
  tradeStockMessage = '';
  alertTypeBuy!: 'buy' | 'sell';
  ticker: any

  constructor(
    private apiService: ApiService,
    private showPortfolioCard: PortfolioCardShowService,
    public dialog: MatDialog
  ) {

  }

  ngOnInit() {
    // Subscribe to trade stock alerts
    this.tradeStockAlert.subscribe(message => {
      // Show trade stock message for 5 seconds
      this.tradeStockMessage = message;
      setTimeout(() => this.tradeStockMessage = '', 5000);
    });
    // Fetch initial data
    this.fetchHoldings();
    // Fetch current money details
    this.apiService.getMoneyDetails().subscribe((result: any) => {
      this.currentMoney = result[0].money;
    });
    console.log("Current Money: " + this.currentMoney);
    // Subscribe to search results
    this.subscription = this.showPortfolioCard.searchResult$.subscribe(result => {
      this.searchResult = result;
    });
  }

  // Fetch holdings data
  fetchHoldings() {
    this.isLoading = true;
    this.apiService.getHoldings().subscribe(data => {
      this.holdings = data as HoldingData[];
      if (this.holdings.length === 0) {
        this.isLoading = false;
        return;
      }
      // Fetch stock and quotes for holdings
      this.fetchStock();
      this.fetchQuotesForHoldings();
    }, error => {
      console.log('Failed to fetch holdings:', error);
      this.isLoading = false;
    });
  }

  // Fetch stock data for holdings
  fetchStock() {
    const namesObservables = this.holdings.map(holding => {
      // Get profile data for each holding
      return this.apiService.getProfileData(holding.ticker.toUpperCase()).pipe(
        catchError(error => {
          console.error(`Failed to fetch name for ${holding.ticker.toUpperCase()}:`, error);
          return of(null); // Return null if error
        })
      );
    });
    // Wait for all profile data
    forkJoin(namesObservables).subscribe(names => {
      // Filter out null entries
      this.stockData = names.filter(name => name !== null) as StockName[];
    }, error => {
      console.error('Failed to fetch quotes:', error);
      this.isLoading = false;
    });
  }

  // Check if cost difference is less than zero
  isCostDiffLessThanZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = (stockCost / stockQuantity) - currentPrice;
    return Number(result.toFixed(2)) < 0;
  }

  // Fetch quotes for holdings
  fetchQuotesForHoldings() {
    const quotesObservables = this.holdings.map(holding => {
      // Get quote data for each holding
      return this.apiService.getQuoteData(holding.ticker.toUpperCase()).pipe(
        catchError(error => {
          console.error(`Failed to fetch quote for ${holding.ticker.toUpperCase()}:`, error);
          return of(null); // Return null if error
        })
      );
    });
    // Wait for all quote data
    forkJoin(quotesObservables).subscribe(quotes => {
      // Filter out null entries
      this.holdingQuote = quotes.filter(quote => quote !== null) as QuoteData[];
      this.isLoading = false; // Update loading state only after all quotes have been fetched
    }, error => {
      console.error('Failed to fetch quotes:', error);
      this.isLoading = false;
    });
  }

  // Open stock modal dialog
  stockModal(toBuy: boolean, ticker: string, stockName: string, currentPrice: number, quantity: number, money: number) {
    console.log("Money: " + money + "ticker: " + ticker + "stockName: " + stockName + "currPrice: " + currentPrice + "q: " + quantity);
    this.ticker = ticker;
    const dialogVar = this.dialog.open(PortfolioCardsComponent, {
      width: '400px',
      data: {
        tickerSymbol: ticker.toUpperCase(),
        stockName: stockName,
        purchase: toBuy,
        marketPrice: currentPrice,
        ownedQuantity: quantity,
        currentMoney: money
      }
    });

    dialogVar.afterClosed().subscribe(result => {
      // Clear data and fetch updated holdings
      this.stockData = [];
      this.holdings = [];
      this.holdingQuote = [];
      this.fetchHoldings();
      // Fetch updated money details
      this.apiService.getMoneyDetails().subscribe((result: any) => {
        this.currentMoney = result[0].money;
      });

      // Handle successful transactions
      if (result && result.success) {
        const upper = this.ticker.toUpperCase();
        console.log("PORTOFOLIO COMPONENT: " + upper)
        if (result.action === 'bought') {
          // Emit buy success alert
          this.tradeStockAlert.next(upper + " bought Successfully");
          this.alertTypeBuy = 'buy'; // Set your alert type for styling if needed
        } else if (result.action === 'sold') {
          // Emit sell success alert
          this.tradeStockAlert.next(upper + " sold Successfully");
          this.alertTypeBuy = 'sell'; // Set your alert type for styling if needed
        }
      }

    });
  }

  // Check if cost difference is greater than zero
  isCostDiffGreaterThanZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = (stockCost / stockQuantity) - currentPrice;
    return Number(result.toFixed(2)) > 0;
  }

  // Check if cost difference is equal to zero
  isCostDiffEqualToZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = (stockCost / stockQuantity) - currentPrice;
    return Number(result.toFixed(2)) === 0;
  }

}
