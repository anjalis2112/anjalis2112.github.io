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



@Component({
  selector: 'ng-search-bar',
  standalone: true,
  imports: [CommonModule,
    MatAutocompleteModule,
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    StockDetailsComponent
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  isLoading = false;
  autoLoading: boolean = false;
  results: any = null;
  queryField: FormControl = new FormControl();
  ticker: string | undefined;
  data: any;
  @ViewChild('searchForm')
  searchForm!: NgForm;

  constructor(private router: Router, private apiService: ApiService, public tickerService: TickerService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.ticker = this.tickerService.ticker || undefined;;
    this.queryField.valueChanges.pipe(
      debounceTime(500)
    ).subscribe((query: string) => {
      if (!query) {
        this.results = null;
        return;
      }
      this.isLoading = true;
      this.getResults(query.trim()).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.results = data.result;
        },
        () => {
          this.isLoading = false;
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

  clearTicker() {
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
    if (this.ticker) {
      console.log("HELLO2")
      this.tickerService.ticker = this.ticker; // Set the ticker property
      this.tickerService.setTicker(this.ticker); // Call setTicker() method
    }
    this.router.navigate(['/search', this.ticker]);
  }
}
