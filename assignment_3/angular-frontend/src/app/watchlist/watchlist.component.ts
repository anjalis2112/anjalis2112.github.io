import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { TickerService } from '../ticker.service';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgIf, NgFor } from '@angular/common';
import { FavoriteData } from '../favorite.interface';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    NgIf,
    NgFor,
    CommonModule
  ],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})
export class WatchlistComponent {
  favorites: FavoriteData[] = [];
  quoteDetails: any;
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private tickerService: TickerService
    ) {}

  ngOnInit() {
    this.fetchFavorites();
  }

  fetchFavorites() {
    this.isLoading = true;
    this.apiService.getFavorites().subscribe(data => {
      this.favorites = data as FavoriteData[];
      if (this.favorites.length === 0) {
        this.isLoading = false;
        return;
      }
      this.fetchQuotesForFavorites();
    }, error => {
      console.log('Failed to fetch favorites:', error);
      this.isLoading = false;
    });
  }

  fetchQuotesForFavorites() {
    const quotesObservables = this.favorites.map(favorite => {
      // get quote for each favorite
      return this.apiService.getQuoteData(favorite.ticker).pipe(
        catchError(error => {
          console.error(`Failed to fetch quote for ${favorite.ticker}:`, error);
          return of(null); // returns null if error
        })
      );
    });
    // wait for all quotes
    forkJoin(quotesObservables).subscribe(quotes => {
      this.quoteDetails = quotes.filter(quote => quote !== null);
      this.isLoading = false; // Update loading state only after all quotes have been fetched
    }, error => {
      console.error('Failed to fetch quotes:', error);
      this.isLoading = false;
    });
  }

  removeFromFavorites(symbol: string) {
    this.apiService.updateFavorites(symbol).subscribe(() => {
      console.log('Removed favorite:', symbol);
      this.fetchFavorites();
    }, error => {
      console.log('Failed to remove favorite:', symbol, error);
    });
  }
}
