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



@Component({
  selector: 'ng-search-bar',
  standalone: true,
  imports: [CommonModule, 
    MatAutocompleteModule, 
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
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

  constructor(private router: Router, private apiService: ApiService, private tickerService: TickerService) { }

  ngOnInit(): void {
    this.queryField.valueChanges.pipe(
      debounceTime(500)
    ).subscribe((query: string) => {
      if (!query) {
        this.results = null;
        return;
      }
      this.isLoading = true;
      console.log(this.isLoading);
      this.getResults(query.trim()).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.results = data.result;
          console.log(this.isLoading);
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
    this.queryField.setValue('');
    this.router.navigate(['']);
  }

  searchStockData(event: any) {
    event.preventDefault();
    event.returnValue = false;
    if (this.ticker) {
      this.tickerService.setTicker(this.ticker);
    }
    this.router.navigate(['/search', this.ticker]);
  }
}
