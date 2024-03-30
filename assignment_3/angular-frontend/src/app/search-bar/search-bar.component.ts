import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ApiService } from '../api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, NgForm, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { TickerService } from '../ticker.service';
import { StockDetailsComponent } from '../stock-details/stock-details.component';
import { ElementRef } from '@angular/core';
import { DataStorerService } from '../data-storer.service';



@Component({
  selector: 'ng-search-bar',
  standalone: true,
  imports: [CommonModule,
    MatAutocompleteModule,
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    StockDetailsComponent,
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  isLoading = false;
  autoLoading: boolean = false;
  results: any = null;
  lastQuery: string = '';
  queryField: FormControl = new FormControl();
  ticker: string | undefined;
  data: any;
  @ViewChild('searchForm')
  searchForm!: NgForm;
  isFound: boolean = true;

  constructor(private router: Router, private apiService: ApiService, public tickerService: TickerService, private elementRef: ElementRef, private dataStorer: DataStorerService) { }

  ngOnInit(): void {
    this.ticker = this.tickerService.ticker || undefined;;
    this.queryField.valueChanges.pipe(
      debounceTime(500)
    ).subscribe((query: string) => {
      if (query !== this.lastQuery) {
        this.results = null; // Clear previous search results
        this.lastQuery = query; // Update last query
      }
      if (!query) {
        this.results = null;
        return;
      }
      this.isLoading = true;
      this.getResults(query.trim()).subscribe(
        (data: any) => {
          this.isLoading = false;
          console.log(this.isFound);
          this.results = data.result;
          console.log(this.results.length);
          if(this.results.length > 0){
            console.log("test isfound");
            this.isFound = true;
            console.log(this.isFound);
          }
          else {
            this.isFound = false;
          }
        },
        () => {
        
          this.results = null;
        }
      );
    });
  }

  getResults(query: string): Observable<any> {
    return new Observable((observer) => {
      this.apiService.getAutoData(query).subscribe(
        (data: any) => {
          // Filter the data based on the specified criteria
          const filteredData = data.result.filter((item: any) => {
            return item.type === 'Common Stock' && !item.displaySymbol.includes('.');
          });
          observer.next({ count: filteredData.length, result: filteredData });
          observer.complete();
        },
        (error: any) => {
          observer.error(error); // Pass along any errors
        }
      );
    });
  }

  selectResult(result: any) {
    this.ticker = result.displaySymbol;
    this.queryField.setValue(result.displaySymbol);
  }
  updateInputFieldUsingPeer(peer: string) {
    this.ticker = peer; // Update the value of the input field
  }

  clearTicker() {
    this.results = null;
    this.isFound = true;
    this.ticker = ''; // Set ticker to an empty string
    this.queryField.setValue(''); // Clear the FormControl value
    // Clear the input field by directly manipulating its DOM element
    const inputElement: HTMLInputElement = this.elementRef.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.value = '';
    }
    this.router.navigate(['']); // Navigate away
    this.tickerService.clearTicker(); // Clear the ticker in the service
  }

  searchStockData(event: any) {
    console.log("HELLO")
    event.preventDefault();
    event.returnValue = false;
    console.log(this.ticker, this.tickerService.prevTicker);
    if (this.ticker && this.ticker !== this.tickerService.prevTicker) {
      console.log("HELLO2")
      this.tickerService.setTicker(this.ticker); // Call setTicker() method
      this.dataStorer.setLastSearchArg(this.ticker);
      this.dataStorer.getLastSearchArg();
      this.router.navigate(['/search', this.ticker]);
    }
    else {
      console.log("HELLO3")
      this.router.navigate(['/search']);
    }
    
  }

  onEnter(event: Event) {
    this.autoLoading = false; // Hide autocomplete dropdown
    if (event instanceof KeyboardEvent) {
        this.searchStockData(event); // Perform search
    }
}
}
