import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, NgFor } from '@angular/common';
import { ApiService } from '../api.service';
import { Subject, Subscription, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DataStorerService } from '../data-storer.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { OpenStockModalService } from '../../services/open-stock-modal.service';
import { MatDialog } from '@angular/material/dialog';
import { PortfolioCardShowService } from '../portfolio-card-show.service';
import { PortfolioCardsComponent } from '../portfolio-cards/portfolio-cards.component';

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
    private dataStorer: DataStorerService,
    private showPortfolioCard: PortfolioCardShowService,
    public dialog: MatDialog
  ) {
   
  }

  ngOnInit() {
    this.tradeStockAlert.subscribe(message => {
      this.tradeStockMessage = message;
      setTimeout(() => this.tradeStockMessage = '', 5000);
    });
    this.fetchHoldings();
    this.apiService.getMoneyDetails().subscribe((result:any) => {
      this.currentMoney = result[0].money;
    });
    console.log("Current Money: " + this.currentMoney);
    // this.currentMoney = this.dataStorer.getCurrentMoney();
    this.subscription = this.showPortfolioCard.searchResult$.subscribe(result => {
      this.searchResult = result;
    });
  }

  fetchHoldings() {
    this.isLoading = true;
    this.apiService.getHoldings().subscribe(data => {
      this.holdings = data as HoldingData[];
      if (this.holdings.length === 0) {
        this.isLoading = false;
        return;
      }
      this.fetchStock();
      this.fetchQuotesForHoldings();
    }, error => {
      console.log('Failed to fetch holdings:', error);
      this.isLoading = false;
    });
  }

  fetchStock() {
    const namesObservables = this.holdings.map(holding => {
      // get quote for each favorite
      return this.apiService.getProfileData(holding.ticker).pipe(
        catchError(error => {
          console.error(`Failed to fetch name for ${holding.ticker}:`, error);
          return of(null); // returns null if error
        })
      );
    });
    // wait for all quotes
    forkJoin(namesObservables).subscribe(names => {
      this.stockData = names.filter(name => name !== null) as StockName[];
      // this.isLoading = false; // Update loading state only after all quotes have been fetched
    }, error => {
      console.error('Failed to fetch quotes:', error);
      this.isLoading = false;
    });
  }

  isLessThanZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = (stockCost / stockQuantity) - currentPrice;
    return Number(result.toFixed(2)) < 0;
  }

  isGreaterThanZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = (stockCost / stockQuantity) - currentPrice;
    return Number(result.toFixed(2)) > 0;
  }

  isEqualToZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = (stockCost / stockQuantity) - currentPrice;
    return Number(result.toFixed(2)) === 0;
  }

  fetchQuotesForHoldings() {
    const quotesObservables = this.holdings.map(holding => {
      // get quote for each favorite
      return this.apiService.getQuoteData(holding.ticker).pipe(
        catchError(error => {
          console.error(`Failed to fetch quote for ${holding.ticker}:`, error);
          return of(null); // returns null if error
        })
      );
    });
    // wait for all quotes
    forkJoin(quotesObservables).subscribe(quotes => {
      this.holdingQuote = quotes.filter(quote => quote !== null) as QuoteData[];
      this.isLoading = false; // Update loading state only after all quotes have been fetched
    }, error => {
      console.error('Failed to fetch quotes:', error);
      this.isLoading = false;
    });   
  }



  stockModal(toBuy: boolean, ticker: string, stockName: string, currentPrice: number, quantity: number, money: number) {
    console.log("Money: " + money + "ticker: " + ticker + "stockName: " + stockName + "currPrice: " + currentPrice + "q: " + quantity );
    this.ticker = ticker;
    const dialogVar = this.dialog.open(PortfolioCardsComponent, {
      width: '400px',
      data: { 
        tickerSymbol: ticker,
        stockName: stockName,
        purchase: toBuy,
        marketPrice: currentPrice,
        ownedQuantity: quantity,
        currentMoney: money
       }
    });

    dialogVar.afterClosed().subscribe(result => {
      this.stockData = [];
      this.holdings = [];
      this.holdingQuote = [];
      this.fetchHoldings();
      this.apiService.getMoneyDetails().subscribe((result:any) => {
        this.currentMoney = result[0].money;
      });

      if (result && result.success) {
        if (result.action === 'bought') {
          this.tradeStockAlert.next(this.ticker + " bought Successfully");
          this.alertTypeBuy = 'buy'; // Set your alert type for styling if needed
        } else if (result.action === 'sold') {
          this.tradeStockAlert.next(this.ticker + " sold Successfully");
          this.alertTypeBuy = 'sell'; // Set your alert type for styling if needed
        }
      }
    
    });
  }

}
