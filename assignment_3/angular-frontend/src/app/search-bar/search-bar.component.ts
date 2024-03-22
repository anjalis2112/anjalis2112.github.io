import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { debounceTime } from 'rxjs/operators';
import { RouterModule, Router } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ApiService } from '../api.service';
import { MatSliderModule } from '@angular/material/slider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, NgForm, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'ng-search-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, ReactiveFormsModule, FormsModule, MatSliderModule, FontAwesomeModule, MatAutocompleteModule, MatProgressSpinnerModule, MatTabsModule, HighchartsChartModule, NgbModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  faSearchIcon = faSearch;
  faTimesIcon = faTimes;
  isLoading = false;
  results: any = null;
  queryField: FormControl = new FormControl();
  query: any;
  ticker: string | undefined;
  data: any;
  @ViewChild('searchForm')
  searchForm!: NgForm;

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
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
          setTimeout(() => { }, 500);
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

  getResults(query: string) {
    return this.apiService.getAutoData(query);
  }
  selectResult(result: any) {
    this.ticker = result.displaySymbol;
    this.queryField.setValue(result.displaySymbol);
  }
}
